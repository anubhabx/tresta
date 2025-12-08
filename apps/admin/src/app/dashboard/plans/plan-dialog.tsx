
import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { usePlans } from '@/lib/hooks/use-plans';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogTrigger, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';

export function PlanDialog() {
    const [open, setOpen] = useState(false);
    const { createPlan } = usePlans();

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('0');
    const [currency, setCurrency] = useState('INR');
    const [interval, setInterval] = useState('month');
    const [type, setType] = useState('FREE');
    const [razorpayPlanId, setRazorpayPlanId] = useState('');
    const [limitsJson, setLimitsJson] = useState('{\n  "projects": 1,\n  "testimonials": 20\n}');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const limits = JSON.parse(limitsJson);
            const priceInPaise = Math.round(parseFloat(price) * 100);

            await createPlan.mutateAsync({
                name,
                description,
                price: priceInPaise,
                currency,
                interval,
                limits,
                type,
                razorpayPlanId: razorpayPlanId || undefined
            });

            setOpen(false);
            resetForm();
        } catch (error) {
            if (error instanceof SyntaxError) {
                toast.error("Invalid JSON in Limits field");
            } else {
                // Handled by mutation error
            }
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('0');
        setCurrency('INR');
        setInterval('month');
        setType('FREE');
        setRazorpayPlanId('');
        setLimitsJson('{\n  "projects": 1,\n  "testimonials": 20\n}');
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Plan</DialogTitle>
                        <DialogDescription>
                            Add a new subscription plan to your offering.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {/* Name */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-3"
                            />
                        </div>

                        {/* Price */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Price ({currency})
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>

                        {/* Interval */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="interval" className="text-right">
                                Interval
                            </Label>
                            <Select value={interval} onValueChange={setInterval}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select interval" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="month">Monthly</SelectItem>
                                    <SelectItem value="year">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Type */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type
                            </Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FREE">Free</SelectItem>
                                    <SelectItem value="PRO">Pro</SelectItem>
                                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Razorpay Plan ID */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="razorpayPlanId" className="text-right">
                                Razorpay Plan ID
                            </Label>
                            <Input
                                id="razorpayPlanId"
                                value={razorpayPlanId}
                                onChange={(e) => setRazorpayPlanId(e.target.value)}
                                className="col-span-3"
                                placeholder="plan_..."
                            />
                        </div>

                        {/* Limits JSON */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="limits" className="text-right mt-2">
                                Limits (JSON)
                            </Label>
                            <div className="col-span-3">
                                <Textarea
                                    id="limits"
                                    value={limitsJson}
                                    onChange={(e) => setLimitsJson(e.target.value)}
                                    className="font-mono text-xs h-32"
                                    required
                                />
                                <p className="text-xs text-muted-foreground mt-1">Specify limits as JSON object.</p>
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={createPlan.isPending}>
                            {createPlan.isPending ? 'Creating...' : 'Create Plan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
