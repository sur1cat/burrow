import ApolloProviderWrapper from "@/providers/apollo-provider-wrapper";
import Navbar from "@/components/Navbar";
import ThemeProvider from "@/components/ThemeProvider";
import HeartbeatProvider from "@/components/HeartbeatProvider";
import "./globals.css";

export const metadata = {
    title: "Burrow - Share Ideas, Connect with Others",
    description: "A warm community for sharing ideas and discussions",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ApolloProviderWrapper>
                    <ThemeProvider>
                        <HeartbeatProvider>
                            <div className="page-wrapper">
                                <Navbar />
                                <main>{children}</main>
                            </div>
                        </HeartbeatProvider>
                    </ThemeProvider>
                </ApolloProviderWrapper>
            </body>
        </html>
    );
}
