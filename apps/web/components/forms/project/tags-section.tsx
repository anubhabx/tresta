import { UseFormRegister } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { ProjectFormData } from "@/lib/schemas/project-schema";

interface TagsSectionProps {
  register: UseFormRegister<ProjectFormData>;
}

export function TagsSection({ register }: TagsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags & Organization</CardTitle>
        <CardDescription>
          Add tags for internal categorization and search
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tagsInput">
            Tags{" "}
            <Badge variant="secondary" className="text-xs font-normal ml-2">
              Optional
            </Badge>
          </Label>
          <Input
            id="tagsInput"
            placeholder="saas, startup, productivity (comma-separated)"
            {...register("tagsInput")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
