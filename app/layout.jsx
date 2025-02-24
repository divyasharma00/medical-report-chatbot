import { Inter, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });
const source_code_pro = Source_Code_Pro({ subsets: ["latin"] });

export const metadata = {
  title: "Mr. AlmostMD",
  description: "The med-school dropout with solid advice",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={source_code_pro.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}