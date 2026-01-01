import { Primary } from "@/utils/colors";
import React from "react";
import { Pressable, PressableProps, Text, ViewStyle } from "react-native";

interface ButtonProps extends Omit<PressableProps, "children"> {
  title?: string;
  variant?: "default" | "header";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children?: React.ReactNode;
}

export function Button({
  style,
  children,
  title,
  variant = "default",
  disabled,
  icon,
  iconPosition = "left",
  ...props
}: ButtonProps) {
  const displayText = title || children;

  const isHeader = variant === "header";

  return (
    <Pressable
      style={[
        isHeader
          ? {
              paddingLeft: 5,
              paddingRight: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }
          : {
              backgroundColor: "white",
              padding: 14,
              borderRadius: 14,
              width: "100%",
            },
        style as ViewStyle,
      ]}
      disabled={disabled}
      {...props}
    >
      {isHeader && icon && iconPosition === "left" && icon}
      {typeof displayText === "string" ? (
        <Text
          style={[
            {
              textAlign: "center",
              fontWeight: "600",
              paddingLeft: 5,
              paddingRight: 0,
            },
            isHeader && {
              color: Primary,
              fontSize: 17,
            },
            disabled &&
              isHeader && {
                opacity: 1,
              },
          ]}
        >
          {displayText}
        </Text>
      ) : (
        displayText
      )}
      {isHeader && icon && iconPosition === "right" && icon}
    </Pressable>
  );
}
