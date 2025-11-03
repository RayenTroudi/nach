import { useState } from "react";

const useFilterSelections = () => {
  const [tempSelections, setTempSelections] = useState<Map<string, any[]>>(
    new Map()
  );

  const handleSelection = (
    setSelected: (value: React.SetStateAction<any[]>) => void,
    selected: boolean,
    value: any,
    allOption: string,
    filterKey: string
  ) => {
    if (typeof setSelected !== "function") {
      console.error("setSelected is not a function", setSelected);
      return;
    }

    setSelected((current: any[]) => {
      if (value === allOption) {
        if (selected) {
          const newTempSelections = new Map(tempSelections);
          newTempSelections.set(filterKey, []);
          setTempSelections(newTempSelections);
          return [allOption];
        } else {
          const tempSelectedOptions = tempSelections.get(filterKey) || [];
          const newTempSelections = new Map(tempSelections);
          newTempSelections.delete(filterKey);
          setTempSelections(newTempSelections);
          return tempSelectedOptions;
        }
      } else {
        if (selected) {
          if (current.includes(allOption)) {
            const updatedTempSelections = (
              tempSelections.get(filterKey) || []
            ).concat(value);
            setTempSelections(
              new Map(tempSelections.set(filterKey, updatedTempSelections))
            );
            return current;
          }

          return current.concat(value);
        } else {
          if (current.includes(allOption)) {
            const updatedTempSelections = (
              tempSelections.get(filterKey) || []
            ).filter((item) => item !== value);
            setTempSelections(
              new Map(tempSelections.set(filterKey, updatedTempSelections))
            );
            return current;
          }

          return current.filter((item) => item !== value);
        }
      }
    });
  };

  return { tempSelections, handleSelection };
};

export default useFilterSelections;
