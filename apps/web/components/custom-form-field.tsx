import React, { useState, useCallback } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Info, Star, X } from "lucide-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Button } from "@workspace/ui/components/button";
import type Color from "color";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerOutput,
  ColorPickerFormat,
} from "@/components/color-picker";
import { FileUpload } from "@workspace/ui/components/file-upload";

// Base props shared by all field types
interface BaseFormFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  disabled?: boolean;
}

// Props for text-based inputs
interface TextFormFieldProps<TFieldValues extends FieldValues>
  extends BaseFormFieldProps<TFieldValues> {
  type: "text" | "email" | "url" | "number";
  onChange?: (value: string) => void;
}

// Props for password input
interface PasswordFormFieldProps<TFieldValues extends FieldValues>
  extends BaseFormFieldProps<TFieldValues> {
  type: "password";
}

// Props for textarea
interface TextareaFormFieldProps<TFieldValues extends FieldValues>
  extends BaseFormFieldProps<TFieldValues> {
  type: "textarea";
  rows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
}

// Props for rating
interface RatingFormFieldProps<TFieldValues extends FieldValues>
  extends BaseFormFieldProps<TFieldValues> {
  type: "rating";
  max?: number;
}

// Props for color picker
interface ColorPickerFormFieldProps<TFieldValues extends FieldValues>
  extends BaseFormFieldProps<TFieldValues> {
  type: "color";
  onChange?: (value: string) => void;
}

// Props for file upload
interface FileUploadFormFieldProps<TFieldValues extends FieldValues>
  extends BaseFormFieldProps<TFieldValues> {
  type: "file";
  onChange?: (files: File[]) => void;
}

// Union type for all field props
type CustomFormFieldProps<TFieldValues extends FieldValues> =
  | TextFormFieldProps<TFieldValues>
  | PasswordFormFieldProps<TFieldValues>
  | TextareaFormFieldProps<TFieldValues>
  | RatingFormFieldProps<TFieldValues>
  | ColorPickerFormFieldProps<TFieldValues>
  | FileUploadFormFieldProps<TFieldValues>;

export function CustomFormField<TFieldValues extends FieldValues>(
  props: CustomFormFieldProps<TFieldValues>,
) {
  const {
    control,
    name,
    label,
    placeholder,
    description,
    required = false,
    optional = false,
    className,
    disabled = false,
  } = props;

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // State for rating hover
  const [hoveredRating, setHoveredRating] = useState(0);

  // Render label with optional/required indicator and info tooltip
  const renderLabel = () => (
    <div className="flex items-center gap-2">
      <FormLabel>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
        {optional && (
          <Badge variant="secondary" className="text-xs font-normal ml-2">
            Optional
          </Badge>
        )}
      </FormLabel>
      {description && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 p-0 hover:bg-transparent"
              >
                <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="max-w-xs relative pr-8"
              onPointerDownOutside={(e) => e.preventDefault()}
            >
              <p className="text-sm">{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );

  // Render text-based inputs (text, email, url, number)
  if (
    props.type === "text" ||
    props.type === "email" ||
    props.type === "url" ||
    props.type === "number"
  ) {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className={className}>
            {renderLabel()}
            <FormControl>
              <Input
                type={props.type}
                placeholder={placeholder}
                disabled={disabled}
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  props.onChange?.(e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Render password input with show/hide toggle
  if (props.type === "password") {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className={className}>
            {renderLabel()}
            <FormControl>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={placeholder}
                  disabled={disabled}
                  {...field}
                />
                {showPassword ? (
                  <FaEyeSlash
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                    title="Hide password"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <FaEye
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                    title="Show password"
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Render textarea with optional character count
  if (props.type === "textarea") {
    const { rows = 4, maxLength, showCharacterCount = false } = props;

    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className={className}>
            {renderLabel()}
            <FormControl>
              <Textarea
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                maxLength={maxLength}
                className="resize-none"
                {...field}
              />
            </FormControl>
            {showCharacterCount && maxLength && (
              <p className="text-sm text-muted-foreground mt-1">
                {(field.value as string)?.length || 0} / {maxLength} characters
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Render rating (star rating)
  if (props.type === "rating") {
    const { max = 5 } = props;

    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => {
          const selectedRating = (field.value as number) || 0;

          return (
            <FormItem className={className}>
              {renderLabel()}
              <FormControl>
                <div className="flex items-center py-2">
                  {Array.from({ length: max }, (_, i) => i + 1).map(
                    (rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => field.onChange(rating)}
                        onMouseEnter={() => setHoveredRating(rating)}
                        onMouseLeave={() => setHoveredRating(0)}
                        disabled={disabled}
                        className="transition-transform hover:scale-110 focus:outline-none focus:ring-none rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Star
                          className={`h-8 w-8 px-0.5 transition-colors ${
                            rating <= (hoveredRating || selectedRating)
                              ? "fill-warning text-warning"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ),
                  )}
                  {selectedRating > 0 && (
                    <span className="ml-2 text-sm font-medium text-muted-foreground">
                      {selectedRating} / {max}
                    </span>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }

  // Render color picker
  if (props.type === "color") {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => {
          // Provide a default color if value is empty or undefined
          const colorValue = field.value || placeholder || "#000000";

          // Memoize the onChange handler to prevent infinite re-renders
          const handleColorChange = useCallback(
            (rgba: Parameters<typeof Color.rgb>[0]) => {
              // Convert RGBA to HEX
              const colorArray = Array.isArray(rgba) ? rgba : [0, 0, 0];
              const [r = 0, g = 0, b = 0] = colorArray;
              const hex = `#${[r, g, b]
                .map((x) => Math.round(x).toString(16).padStart(2, "0"))
                .join("")}`;

              // Update the form field value
              field.onChange(hex);
              if (props.onChange) {
                props.onChange(hex);
              }
            },
            [field.onChange],
          );

          return (
            <FormItem className={className}>
              {renderLabel()}
              <ColorPicker
                value={colorValue}
                defaultValue={colorValue}
                onChange={handleColorChange as any}
                className="w-full"
              >
                <div className="flex gap-2">
                  <div className="flex flex-col gap-2 flex-1">
                    <ColorPickerSelection className="h-32" />
                    <div className="flex gap-2">
                      <ColorPickerHue />
                      <ColorPickerAlpha />
                    </div>
                    <div className="flex gap-2">
                      <ColorPickerFormat className="flex-1" />
                      <div className="flex gap-1">
                        <ColorPickerOutput />
                        <ColorPickerEyeDropper />
                      </div>
                    </div>
                  </div>
                </div>
              </ColorPicker>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  }

  // Render file upload
  if (props.type === "file") {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className={className}>
            {renderLabel()}
            <FormControl>
              <FileUpload
                onChange={(files) => {
                  field.onChange(files);
                  props.onChange?.(files);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return null;
}
