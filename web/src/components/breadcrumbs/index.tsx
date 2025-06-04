import { FC } from "react";
import { Breadcrumbs, Text, Anchor } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";

interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

const BreadcrumbsComponent: FC<BreadcrumbsProps> = ({ items }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const defaultItems: BreadcrumbItem[] = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const title = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      title,
      href: path,
    };
  });

  const breadcrumbItems = items || defaultItems;

  return (
    <Breadcrumbs separator={<IoChevronForward size={14} />} className="mb-4">
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        if (isLast) {
          return (
            <Text key={item.href} size="sm" fw={500}>
              {item.title}
            </Text>
          );
        }

        return (
          <Anchor
            key={item.href}
            component={Link}
            to={item.href || "#"}
            size="sm"
          >
            {item.title}
          </Anchor>
        );
      })}
    </Breadcrumbs>
  );
};

export default BreadcrumbsComponent;
