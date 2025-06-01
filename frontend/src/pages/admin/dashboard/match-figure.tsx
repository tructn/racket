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
  color?: "blue" | "sky" | "cyan";
}

const MatchFigure: React.FC<Prop> = ({
  figure,
  smallFigure,
  label,
  icon,
  onActionClick,
  actionIcon,
  color = "blue",
}) => {
  const getGradientColors = (color: Prop["color"]) => {
    switch (color) {
      case "blue":
        return "from-blue-50 to-blue-100";
      case "sky":
        return "from-sky-50 to-sky-100";
      case "cyan":
        return "from-cyan-50 to-cyan-100";
      default:
        return "from-blue-50 to-blue-100";
    }
  };

  const getTextColor = (color: Prop["color"]) => {
    switch (color) {
      case "blue":
        return "text-blue-700";
      case "sky":
        return "text-sky-700";
      case "cyan":
        return "text-cyan-700";
      default:
        return "text-blue-700";
    }
  };

  const getIconColor = (color: Prop["color"]) => {
    switch (color) {
      case "blue":
        return "text-blue-600";
      case "sky":
        return "text-sky-600";
      case "cyan":
        return "text-cyan-600";
      default:
        return "text-blue-600";
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
