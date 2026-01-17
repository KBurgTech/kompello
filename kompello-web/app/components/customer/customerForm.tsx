import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import type { Customer } from "~/lib/api/kompello";
import { KompelloApi } from "~/lib/api/kompelloApi";
import { useImperativeHandle } from "react";
import { PersonalInfoSection, ContactInfoSection, AddressSection, NotesSection } from "./customerFormSections";

export const customerSchema = z.object({
    title: z.string().max(50).optional().nullable(),
    firstname: z.string().max(100).optional().nullable(),
    lastname: z.string().max(100).optional().nullable(),
    birthdate: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    mobilePhone: z.string().max(50).optional().nullable(),
    landlinePhone: z.string().max(50).optional().nullable(),
    notes: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
    address: z.object({
        street: z.string().max(255),
        street2: z.string().max(255).optional().nullable(),
        city: z.string().max(100),
        state: z.string().max(100).optional().nullable(),
        postalCode: z.string().max(20),
        country: z.string().max(100),
    }).optional().nullable(),
});

export type CustomerFormSchema = z.infer<typeof customerSchema>;

// Helper function to format date to YYYY-MM-DD for input[type="date"]
function formatDateForInput(date: string | Date | undefined): string {
    if (!date) return "";
    
    // If it's already a string in YYYY-MM-DD format, return it
    if (typeof date === "string") {
        // Check if it's already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
            return date.split("T")[0]; // Remove time portion if present
        }
        return "";
    }
    
    // If it's a Date object, format it
    if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    
    return "";
}

interface CustomerFormProps {
    customer: Customer | null;
    companyId: string;
    onSave?: () => void;
    onActiveChange?: (active: boolean) => void;
    ref?: React.ForwardedRef<{ submitForm: () => void; setActive: (active: boolean) => void }>;
}

export default function CustomerForm({ customer, companyId, onSave, onActiveChange, ref }: CustomerFormProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const form = useForm<CustomerFormSchema>({
        resolver: zodResolver(customerSchema),
        mode: "onChange",
        defaultValues: {
            title: customer?.title || "",
            firstname: customer?.firstname || "",
            lastname: customer?.lastname || "",
            birthdate: formatDateForInput(customer?.birthdate),
            email: customer?.email || "",
            mobilePhone: customer?.mobilePhone || "",
            landlinePhone: customer?.landlinePhone || "",
            notes: customer?.notes || "",
            isActive: customer?.isActive ?? true,
            address: customer?.address ? {
                street: customer.address.street || "",
                street2: customer.address.street2 || "",
                city: customer.address.city || "",
                state: customer.address.state || "",
                postalCode: customer.address.postalCode || "",
                country: customer.address.country || "",
            } : {
                street: "",
                street2: "",
                city: "",
                state: "",
                postalCode: "",
                country: "",
            },
        },
    });

    // Expose form methods to parent component
    useImperativeHandle(ref, () => ({
        submitForm: () => {
            form.handleSubmit(handleSubmit)();
        },
        setActive: (active: boolean) => {
            form.setValue("isActive", active);
            handleActiveChange(active);
        },
    }));

    async function handleSubmit(values: CustomerFormSchema) {
        try {
            // Convert birthdate string to Date if provided
            const birthdate = values.birthdate ? new Date(values.birthdate) : null;

            if (customer?.uuid) {
                // Update existing customer
                const patchData: Record<string, unknown> = {
                    title: values.title || "",
                    firstname: values.firstname || "",
                    lastname: values.lastname || "",
                    birthdate: birthdate,
                    email: values.email || "",
                    mobilePhone: values.mobilePhone || "",
                    landlinePhone: values.landlinePhone || "",
                    notes: values.notes || "",
                    isActive: values.isActive,
                };

                // Add address if provided
                if (values.address) {
                    patchData.address = {
                        street: values.address.street || "",
                        street2: values.address.street2 || "",
                        city: values.address.city || "",
                        state: values.address.state || "",
                        postalCode: values.address.postalCode || "",
                        country: values.address.country || "",
                    };
                }

                const content = {
                    uuid: customer.uuid,
                    patchedCustomer: patchData as any,
                };
                await KompelloApi.customersApi.customersPartialUpdate(content);
                queryClient.invalidateQueries({ queryKey: ["customers", customer.uuid] });
            } else {
                // Create new customer
                const createData: Record<string, unknown> = {
                    company: companyId,
                    title: values.title || "",
                    firstname: values.firstname || "",
                    lastname: values.lastname || "",
                    birthdate: birthdate,
                    email: values.email || "",
                    mobilePhone: values.mobilePhone || "",
                    landlinePhone: values.landlinePhone || "",
                    notes: values.notes || "",
                    isActive: values.isActive,
                };

                // Add address if provided
                if (values.address) {
                    createData.address = {
                        street: values.address.street || "",
                        street2: values.address.street2 || "",
                        city: values.address.city || "",
                        state: values.address.state || "",
                        postalCode: values.address.postalCode || "",
                        country: values.address.country || "",
                    };
                }

                const content = {
                    customer: createData as any,
                };
                await KompelloApi.customersApi.customersCreate(content);
                queryClient.invalidateQueries({ queryKey: ["customers", companyId] });
            }
            onSave?.();
        } catch (error) {
            console.error("Error saving customer:", error);
        }
    }

    // Handle active status changes
    function handleActiveChange(active: boolean) {
        form.setValue("isActive", active);
        onActiveChange?.(active);
    }

    return (
        <div className="space-y-4">
            <PersonalInfoSection form={form} onSubmit={handleSubmit} />
            <ContactInfoSection form={form} onSubmit={handleSubmit} />
            <AddressSection form={form} onSubmit={handleSubmit} />
            <NotesSection form={form} onSubmit={handleSubmit} />
        </div>
    );
}
