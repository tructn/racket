import React from "react";
import { ActionIcon, Text } from "@mantine/core";
import { FiEdit } from "react-icons/fi";
import { motion } from "framer-motion";
import cx from "clsx";

interface Prop {
  label: string;
  figure?: string;
  smallFigure?: string;
  icon?: React.ReactNode;
  onActionClick?: () => void;
  actionIcon?: React.ReactNode;
  color?:
    | "indigo"
    | "violet"
    | "emerald"
    | "rose"
    | "amber"
    | "cyan"
    | "fuchsia";
}

const MatchFigure: React.FC<Prop> = ({
  figure,
  smallFigure,
  label,
  icon,
  onActionClick,
  actionIcon,
  color = "indigo",
}) => {
  const getGradientColors = (color: Prop["color"]) => {
    switch (color) {
      case "indigo":
        return "from-indigo-50 to-indigo-100";
      case "violet":
        return "from-violet-50 to-violet-100";
      case "emerald":
        return "from-emerald-50 to-emerald-100";
      case "rose":
        return "from-rose-50 to-rose-100";
      case "amber":
        return "from-amber-50 to-amber-100";
      case "cyan":
        return "from-cyan-50 to-cyan-100";
      case "fuchsia":
        return "from-fuchsia-50 to-fuchsia-100";
      default:
        return "from-indigo-50 to-indigo-100";
    }
  };

  const getTextColor = (color: Prop["color"]) => {
    switch (color) {
      case "indigo":
        return "text-indigo-700";
      case "violet":
        return "text-violet-700";
      case "emerald":
        return "text-emerald-700";
      case "rose":
        return "text-rose-700";
      case "amber":
        return "text-amber-700";
      case "cyan":
        return "text-cyan-700";
      case "fuchsia":
        return "text-fuchsia-700";
      default:
        return "text-indigo-700";
    }
  };

  const getIconColor = (color: Prop["color"]) => {
    switch (color) {
      case "indigo":
        return "text-indigo-600";
      case "violet":
        return "text-violet-600";
      case "emerald":
        return "text-emerald-600";
      case "rose":
        return "text-rose-600";
      case "amber":
        return "text-amber-600";
      case "cyan":
        return "text-cyan-600";
      case "fuchsia":
        return "text-fuchsia-600";
      default:
        return "text-indigo-600";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cx(
        "group relative flex h-32 w-full flex-col justify-between rounded-lg p-6 shadow-sm transition-all duration-300 hover:shadow-md",
        `bg-gradient-to-br ${getGradientColors(color)}`,
      )}
    >
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.2 }}
          className={cx("flex items-center gap-2", getIconColor(color))}
        >
          {icon}
          <Text size="sm" fw={500} className={getTextColor(color)}>
            {label}
          </Text>
        </motion.div>
        {onActionClick && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ActionIcon
              variant="subtle"
              onClick={onActionClick}
              className={cx(
                "opacity-0 transition-opacity group-hover:opacity-100",
                getIconColor(color),
              )}
            >
              {actionIcon ? actionIcon : <FiEdit size={16} />}
            </ActionIcon>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-baseline gap-2"
      >
        <Text size="xl" fw={700} className={getTextColor(color)}>
          {figure}
        </Text>
        {smallFigure && (
          <Text size="sm" fw={500} className="text-slate-500">
            {smallFigure}
          </Text>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MatchFigure;
