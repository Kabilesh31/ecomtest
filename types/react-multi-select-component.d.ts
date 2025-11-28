declare module "react-multi-select-component" {
  import { ComponentType } from "react";

  export interface Option {
    label: string;
    value: string;
  }

  interface MultiSelectProps {
    options: Option[];
    value: Option[];
    onChange: (selected: Option[]) => void;
    labelledBy?: string;
    hasSelectAll?: boolean;
    overrideStrings?: { selectSomeItems?: string };
  }

  const MultiSelect: ComponentType<MultiSelectProps>;
  export default MultiSelect;
}
