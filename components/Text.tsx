import { Text as RNText, TextProps } from "react-native";
import React from "react";

interface CustomTextProps extends TextProps {
  children: React.ReactNode;
}
export function Text({ children, style, ...props }: CustomTextProps) {
  return (
    <RNText style={[{ color: "#ffffffff" }, style]} {...props}>
      {children}
    </RNText>
  );
}
