import ClientLayout from "@/app/clientLayout";

export default function AboutPage() {
  return (
    <ClientLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">About Us</h1>
        <p>This is the about us page. We are a platform connecting skilled artisans with customers.</p>
      </div>
    </ClientLayout>
  );
}