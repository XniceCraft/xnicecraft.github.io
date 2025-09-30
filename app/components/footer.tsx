import { SiGithub } from "@icons-pack/react-simple-icons";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="md:container md:mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-3 items-center">
          <p className="text-gray-500">Find me at: </p>
          <a
            href="https://github.com/XniceCraft"
            className="text-gray-500 hover:text-gray-90"
          >
            <SiGithub className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} XniceCraft. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
