const serviceProviderCategoryLabels = {
    physiotherapy: "Fysioterapi",
    swimming_pool: "Svømmehal",
    fitness_center: "Fitnesscenter",
    other: "Andet",
} as const;

type ServiceProviderCategory = keyof typeof serviceProviderCategoryLabels;

interface ServiceProviderCompany {
    id: string;
    name: string;
    category: ServiceProviderCategory;
    phone: string | null;
    email: string | null;
}

interface ServiceProviderStaff {
    userId: string;
    userName: string;
    userEmail: string;
    companyId: string;
    companyName: string;
}

export { serviceProviderCategoryLabels };
export type {
    ServiceProviderCategory,
    ServiceProviderCompany,
    ServiceProviderStaff,
};
