import { Pressable, PressableProps, Text, ViewStyle } from "react-native";

interface ButtonProps extends PressableProps {
  title?: string;
  variant?: "default" | "header";
}

export function Button({
  style,
  children,
  title,
  variant = "default",
  disabled,
  ...props
}: ButtonProps) {
  const displayText = title || children;

  const isHeaderRight = variant === "header";

  return (
    <Pressable
      style={[
        isHeaderRight
          ? {
              padding: 0,
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
      {typeof displayText === "string" ? (
        <Text
          style={[
            {
              textAlign: "center",
              fontWeight: "600",
            },
            isHeaderRight && {
              color: "#ffffffff",
              fontSize: 17,
              paddingHorizontal: 12,
            },
            disabled &&
              isHeaderRight && {
                opacity: 1,
              },
          ]}
        >
          {displayText}
        </Text>
      ) : (
        displayText
      )}
    </Pressable>
  );
}
