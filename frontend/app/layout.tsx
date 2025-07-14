import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "智能货币兑换策略系统 | Intelligent Currency Exchange System",
  description: "基于AI与大数据的智能金融决策平台 - AI and Big Data Powered Financial Decision Platform",
  generator: "智能金融平台",
  keywords: "汇率预测,外汇兑换,AI金融,LSTM模型,情感分析,智能投资",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
