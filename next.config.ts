import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // iwinv VPS 의 Docker 이미지가 쓰는 최소 실행 묶음(.next/standalone).
  output: "standalone",
};

export default nextConfig;
