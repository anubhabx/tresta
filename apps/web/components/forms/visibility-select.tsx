import { ProjectVisibility } from "@/types/api";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@workspace/ui/components/select";

interface VisibilitySelectProps {
  value?: ProjectVisibility;
  onValueChange: (value: ProjectVisibility) => void;
  required?: boolean;
}

export function VisibilitySelect({
  value,
  onValueChange,
  required = false
}: VisibilitySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="visibility">
        Visibility{" "}
        {!required && (
          <Badge variant="secondary" className="text-xs font-normal ml-2">
            Optional
          </Badge>
        )}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="visibility">
          <SelectValue placeholder="Select visibility" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ProjectVisibility.PUBLIC}>Public</SelectItem>
          <SelectItem value={ProjectVisibility.PRIVATE}>Private</SelectItem>
          <SelectItem value={ProjectVisibility.INVITE_ONLY}>
            Invite Only
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
