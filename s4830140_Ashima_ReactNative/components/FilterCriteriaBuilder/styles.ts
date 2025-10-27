import { StyleSheet } from "react-native";
import { Colors } from "../../constants/theme";

/** Shared styles for the FilterCriteriaBuilder suite */
export const styles = StyleSheet.create({
  /* Container */
  wrapper: {
    backgroundColor: Colors.WHITE,
    borderColor: Colors.CARD_BORDER,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  header: {
    fontWeight: "700",
    color: Colors.TEXT_DARK,
    marginBottom: 8,
  },

  /* Rule card */
  card: {
    borderColor: Colors.CARD_BORDER,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    backgroundColor: Colors.BACKGROUND,
  },
  joinRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  /* Chips (rectangular) */
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chipRect: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.CARD_BORDER,
  },
  chipRectActive: {
    backgroundColor: Colors.PRIMARY,
  },
  chipRectInactive: {
    backgroundColor: Colors.WHITE,
  },
  chipRectText: {
    fontWeight: "600",
  },
  chipRectTextActive: {
    color: Colors.WHITE,
  },
  chipRectTextInactive: {
    color: Colors.TEXT_DARK,
  },
  chipDisabled: {
    opacity: 0.5,
  },

  /* Generic blocks */
  block: {
    marginBottom: 10,
  },
  blockLabel: {
    color: Colors.TEXT_DARK,
    marginBottom: 6,
  },

  /* Switches */
  switchRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  switchItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
  },
  switchLabel: {
    marginLeft: 8,
    color: Colors.TEXT_DARK,
  },

  /* Text input */
  input: {
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.CARD_BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.TEXT_DARK,
  },

  /* Footer buttons */
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btnGhost: {
    backgroundColor: Colors.BACKGROUND,
    borderColor: Colors.CARD_BORDER,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    width: "32%",
    alignItems: "center",
  },
  btnGhostText: {
    color: Colors.TEXT_DARK,
    fontWeight: "700",
  },
  btnWhite: {
    backgroundColor: Colors.WHITE,
    borderColor: Colors.CARD_BORDER,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    width: "32%",
    alignItems: "center",
  },
  btnWhiteText: {
    color: Colors.TEXT_DARK,
    fontWeight: "700",
  },
  btnApply: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    width: "32%",
    alignItems: "center",
  },
  btnApplyDisabled: {
    backgroundColor: "#cbbfb3",
  },
  btnApplyText: {
    color: Colors.WHITE,
    fontWeight: "700",
  },

  /* Remove row */
  removeRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  btnDanger: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: Colors.DANGER,
  },
  btnDangerText: {
    color: Colors.WHITE,
    fontWeight: "700",
  },
});
