/** @type {import('next').NextConfig} */
const nextConfig = {
    // (Optional) Export as a standalone site
    output: 'standalone', // Feel free to modify/remove this option
    
    // Indicate that these packages should not be bundled by webpack
    experimental: {
        serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
    },
     
};

export default nextConfig;