
import React from 'react';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface GameCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title?: string;
  description?: string;
  headerClassName?: string;
  footerClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export function GameCard({
  title,
  description,
  headerClassName,
  footerClassName,
  contentClassName,
  titleClassName,
  descriptionClassName,
  children,
  footer,
  className,
  ...props
}: GameCardProps) {
  return (
    <Card className={cn("game-card", className)} {...props}>
      {(title || description) && (
        <CardHeader className={headerClassName}>
          {title && <CardTitle className={cn("text-xl font-bold", titleClassName)}>{title}</CardTitle>}
          {description && <CardDescription className={descriptionClassName}>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn("space-y-4", contentClassName)}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className={footerClassName}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
