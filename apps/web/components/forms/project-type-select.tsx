import { ProjectType } from "@/types/api";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@workspace/ui/components/select";

interface ProjectTypeSelectProps {
  value?: ProjectType;
  onValueChange: (value: ProjectType) => void;
  required?: boolean;
}

export function ProjectTypeSelect({
  value,
  onValueChange,
  required = false
}: ProjectTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="projectType">
        Project Type{" "}
        {!required && (
          <Badge variant="secondary" className="text-xs font-normal ml-2">
            Optional
          </Badge>
        )}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="projectType">
          <SelectValue placeholder="Select project type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ProjectType.SAAS_APP}>SaaS App</SelectItem>
          <SelectItem value={ProjectType.PORTFOLIO}>Portfolio</SelectItem>
          <SelectItem value={ProjectType.MOBILE_APP}>Mobile App</SelectItem>
          <SelectItem value={ProjectType.CONSULTING_SERVICE}>
            Consulting Service
          </SelectItem>
          <SelectItem value={ProjectType.E_COMMERCE}>E-Commerce</SelectItem>
          <SelectItem value={ProjectType.AGENCY}>Agency</SelectItem>
          <SelectItem value={ProjectType.FREELANCE}>Freelance</SelectItem>
          <SelectItem value={ProjectType.PRODUCT}>Product</SelectItem>
          <SelectItem value={ProjectType.COURSE}>Course</SelectItem>
          <SelectItem value={ProjectType.COMMUNITY}>Community</SelectItem>
          <SelectItem value={ProjectType.OTHER}>Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
