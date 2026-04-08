"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

// Safe check for File on SSR
const isBrowser = typeof window !== "undefined";

const courseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  description: z.string().min(1, "Description is required"),
  thumbnail: z.any().optional(), // accept File object
  urlSlug: z.string().min(1, "Course URL slug is required")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens are allowed"),
  access: z.enum(["draft", "free", "paid", "private", "coming_soon"]),
  price: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.access === "paid" && (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Valid positive price is required for paid courses",
      path: ["price"]
    });
  }
});

type CourseFormValues = z.infer<typeof courseSchema>;

const Stepper = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const percent = (currentStep / totalSteps) * 100;

  const stepLabels = [
    "Course Info",
    "URL Slug",
    "Access Level",
    "Pricing"
  ];
  const currentLabel = stepLabels[currentStep - 1];

  return (
    <div className="mb-8 w-full shrink-0">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-semibold text-primary">{currentLabel}</span>
        <span className="text-xs font-medium text-muted-foreground">Step {currentStep} of {totalSteps}</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default function CreateCourseModal({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      description: "",
      thumbnail: undefined,
      urlSlug: "",
      access: "draft",
      price: "",
    },
    mode: "onChange",
  });

  const { watch, trigger } = form;
  const access = watch("access");
  const totalSteps = access === "paid" ? 4 : 3;
  const thumbFile = watch("thumbnail");

  useEffect(() => {
    if (isBrowser && thumbFile && thumbFile instanceof File) {
      const url = URL.createObjectURL(thumbFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [thumbFile]);

  const handleNext = async () => {
    let fieldsToValidate: (keyof CourseFormValues)[] = [];
    if (step === 1) fieldsToValidate = ["name", "description"];
    if (step === 2) fieldsToValidate = ["urlSlug"];
    if (step === 3) fieldsToValidate = ["access"];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const onFinalSubmit = form.handleSubmit((data) => {
    console.log("Submitted course data:", data);
    // Submit to API
    setOpen(false);
    setStep(1);
    form.reset();
  });

  // Preview data
  const currentName = watch("name") || "Course Name";
  const currentDesc = watch("description") || "Course Description over here...";

  // Shared input reset classes for avoiding shadow borders
  const inputNoRing = "focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-within:ring-0 focus-within:ring-offset-0 shadow-none";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[95vw] lg:max-w-[1200px] w-full p-0 bg-background shadow-2xl h-[90vh] flex flex-col overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Left Side: Preview */}
          <div className="p-12 flex flex-col justify-center items-center relative lg:w-[45%] xl:w-[40%] lg:border-r border-b lg:border-b-0 shrink-0 overflow-y-auto hidden md:flex">
            <div className="w-full max-w-[400px] rounded-3xl overflow-hidden bg-card border border-primary/10 mt-10 lg:mt-0">
              <div className="w-full aspect-video bg-muted/80 flex items-center justify-center overflow-hidden relative">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="thumbnail" className="object-cover w-full h-full" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <div className="w-16 h-16 mb-4 rounded-xl bg-background/50 flex items-center justify-center shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                    </div>
                    <span className="text-sm font-semibold tracking-wide">No Image Provided</span>
                  </div>
                )}
              </div>
              <div className="p-8">
                <h3 className="font-extrabold text-2xl md:text-3xl leading-tight line-clamp-2">{currentName}</h3>
                <p className="text-sm md:text-[15px] leading-relaxed text-muted-foreground mt-4 line-clamp-3 break-words">{currentDesc}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary uppercase tracking-widest">
                    {access.replace("_", " ")}
                  </span>
                  {access === "paid" && watch("price") && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 capitalize tracking-widest">
                      ${watch("price")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form (Scrollable) */}
          <div className="p-8 sm:p-10 lg:p-12 flex flex-col flex-1 relative bg-card overflow-y-auto">
            <DialogHeader className="mb-8 shrink-0">
              <DialogTitle className="text-3xl font-bold tracking-tight">Create New Course</DialogTitle>
            </DialogHeader>

            <Stepper currentStep={step} totalSteps={totalSteps} />

            <Form {...form}>
              <form
                onSubmit={(e) => { e.preventDefault(); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if ((e.target as any).tagName?.toLowerCase() === 'textarea') {
                      return;
                    }
                    if (step < totalSteps) {
                      handleNext();
                    } else {
                      onFinalSubmit();
                    }
                  }
                }}
                className="flex-1 flex flex-col min-h-0"
              >
                <div className="flex-1 space-y-8 pb-4">
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Course Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Master OSP Engineering" className={`border-muted-foreground/20 bg-background ${inputNoRing}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="What will students learn?"
                                className={`resize-none h-32 border-muted-foreground/20 leading-relaxed bg-background ${inputNoRing}`}
                                {...field}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.stopPropagation();
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="thumbnail"
                        render={({ field: { value, onChange, ...rest } }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Course Image <span className="text-muted-foreground font-normal text-xs ml-2">(Optional)</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  className={`border-muted-foreground/20 bg-background cursor-pointer p-1
                                              file:text-primary file:font-medium
                                              file:px-3
                                              file:mr-4 file:h-full
                                              ${inputNoRing}`
                                            }
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    onChange(file);
                                  }}
                                  {...rest}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                      <FormField
                        control={form.control}
                        name="urlSlug"
                        render={({ field: { onChange, value, ...rest } }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Course URL Slug</FormLabel>
                            <FormControl>
                              <div className="flex rounded-md border border-muted-foreground/20 bg-background focus-within:border-primary/50 transition-colors">
                                <span className="inline-flex items-center px-4 rounded-l-md border-r border-r-muted-foreground/20 bg-muted/50 text-muted-foreground text-sm font-medium">
                                  skarion.com/
                                </span>
                                <Input
                                  {...rest}
                                  value={value}
                                  onChange={(e) => {
                                    const formatted = e.target.value.replace(/[\s-]+/g, '-').toLowerCase();
                                    onChange(formatted);
                                  }}
                                  placeholder="e.g. master-osp-engineering"
                                  className={`rounded-l-none border-0 bg-transparent ${inputNoRing}`}
                                />
                              </div>
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-2">This will be used as the public URL path for your course. Spaces are automatically formatted.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                      <FormField
                        control={form.control}
                        name="access"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium block mb-3">Course Access Level</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-2"
                              >
                                {[
                                  { value: "draft", label: "Draft (Hidden)" },
                                  { value: "free", label: "Free (Open to all)" },
                                  { value: "paid", label: "Paid (Requires purchase)" },
                                  { value: "private", label: "Private (Invite only)" },
                                  { value: "coming_soon", label: "Coming Soon" },
                                ].map((option) => (
                                  <FormItem
                                    key={option.value}
                                    className={`flex items-center space-x-3 space-y-0 p-3.5 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer ${field.value === option.value ? 'border-primary ring-1 ring-primary/50 bg-primary/5' : 'border-muted-foreground/20'}`}
                                  >
                                    <FormControl>
                                      <RadioGroupItem
                                        value={option.value}
                                        id={`access-${option.value}`}
                                        onClick={() => field.onChange(option.value)}
                                      />
                                    </FormControl>
                                    <FormLabel
                                      htmlFor={`access-${option.value}`}
                                      className="font-medium text-sm w-full cursor-pointer !mt-0 leading-none h-full flex items-center"
                                    >
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">Course Price (USD)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="99.00" className={`border-muted-foreground/20 bg-background ${inputNoRing}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-4 border-t flex justify-end items-center bg-card shrink-0">
                  <div className="flex gap-3 w-full sm:w-auto">
                    {step > 1 && (
                      <Button type="button" variant="outline" className="px-6 font-semibold flex-1 sm:flex-none" onClick={handleBack}>
                        Back
                      </Button>
                    )}
                    {step < totalSteps ? (
                      <Button type="button" className="px-8 font-bold flex-1 sm:flex-none shadow-none" onClick={handleNext}>
                        Continue
                      </Button>
                    ) : (
                      <Button type="button" onClick={onFinalSubmit} className="px-8 font-bold bg-primary hover:bg-primary/90 flex-1 sm:flex-none shadow-none">
                        Create Course
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
