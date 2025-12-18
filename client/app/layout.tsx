import ApolloProviderWrapper from "@/providers/apollo-provider-wrapper";
import Navbar from "@/components/Navbar";
import "./globals.css";

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>
        <ApolloProviderWrapper>
            <Navbar />
            {children}
        </ApolloProviderWrapper>
        </body>
        </html>
    );
}
