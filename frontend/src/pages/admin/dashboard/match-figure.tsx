import React from "react";
import { ActionIcon, Text } from "@mantine/core";
import { FiEdit } from "react-icons/fi";
import { motion } from "framer-motion";

interface Prop {
  label: string;
  figure?: string;
  smallFigure?: string;
  icon?: React.ReactNode;
  onActionClick?: () => void;
  actionIcon?: React.ReactNode;
}

const MatchFigure: React.FC<Prop> = ({
  figure,
  smallFigure,
  label,
  icon,
  onActionClick,
  actionIcon,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex h-32 w-full flex-col justify-between rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 p-6 shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 text-slate-600"
        >
          {icon}
          <Text size="sm" fw={500}>
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
              className="opacity-0 transition-opacity group-hover:opacity-100"
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
        <Text size="xl" fw={700} className="text-slate-800">
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
