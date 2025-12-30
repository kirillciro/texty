import { StyleSheet, TextInput, TextInputProps } from "react-native";

export default function Input(props: TextInputProps) {
  const { style, ...rest } = props;
  return (
    <TextInput
      {...rest}
      placeholderTextColor="rgba(255, 255, 255, 0.4)"
      style={StyleSheet.flatten([
        {
          padding: 20,
          fontSize: 16,
          borderRadius: 20,
          backgroundColor: "rgba(26, 26, 26, 0.28)",
          borderWidth: 1,
          borderColor: "rgba(107, 107, 107, 0.26)",
          color: "#ffffff",
          shadowColor: "#161616a6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        },
        style,
      ])}
    />
  );
}
