export type User = {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone?: string;
  createdAt: string;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
};

export type ProductImage = { url: string; publicId?: string };

export type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category?: Category | string;
  images: ProductImage[];
  stock: number;
  isFeatured: boolean;
  isActive: boolean;
  tags: string[];
  createdAt: string;
};

export type OrderItem = {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export type ShippingAddress = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
};

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type Order = {
  _id: string;
  user: { _id: string; name: string; email: string } | string | null;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  itemsTotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "cod" | "zoho";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
};

export type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "resolved";
  createdAt: string;
};

export type VolunteerApplication = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  availability: string;
  skills: string;
  message: string;
  status: "new" | "contacted" | "onboarded" | "declined";
  createdAt: string;
};

export type NewsletterSubscriber = {
  _id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  createdAt: string;
};

export type DonationAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type Donation = {
  _id: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  panNumber: string;
  address: DonationAddress;
  amount: number;
  project: string;
  projectName: string;
  isRecurring: boolean;
  message?: string;
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: string;
};

export type Project = {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
};

export const BOOK_CONDITIONS = ["New", "Like New", "Good", "Acceptable"] as const;
export type BookCondition = (typeof BOOK_CONDITIONS)[number];

export type BookDonationStatus = "pending_review" | "approved" | "rejected";

export type BookDonation = {
  _id: string;
  donor: {
    fullName: string;
    dateOfBirth?: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
  };
  book: {
    title: string;
    author: string;
    publisher?: string;
    edition?: string;
    isbn?: string;
    subject: string;
    category: string;
    academicLevel: string;
    condition: BookCondition;
    quantity: number;
    language: string;
  };
  photos: ProductImage[];
  additionalNotes?: string;
  consent: boolean;
  deliveryMethod?: "drop_off" | "courier" | "not_specified";
  status: BookDonationStatus;
  adminNote?: string;
  product?: string;
  createdAt: string;
};

export type BookRequestStatus = "pending" | "approved" | "fulfilled" | "rejected";

export type BookRequest = {
  _id: string;
  student: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    institutionName: string;
    courseClass: string;
    yearSemester: string;
  };
  book: {
    name: string;
    author?: string;
    subject: string;
    edition?: string;
    quantityRequired: number;
  };
  reason: string;
  studentIdDocument: ProductImage;
  supportingDocument?: ProductImage;
  status: BookRequestStatus;
  adminNote?: string;
  createdAt: string;
};
