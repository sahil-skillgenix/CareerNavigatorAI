export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <p className="text-gray-300 text-sm text-center">© {new Date().getFullYear()} Skillgenix. All rights reserved.</p>
      </div>
    </footer>
  );
}
