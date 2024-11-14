import { ControllerRenderProps } from 'react-hook-form';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { FormControl, FormDescription } from '../ui/form';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { Fragment, useState } from 'react';

const graphColors = [
  { label: 'Red', value: 'red', hex: '#FF0000' },
  { label: 'Blue', value: 'blue', hex: '#0000FF' },
  { label: 'Green', value: 'green', hex: '#008000' },
  { label: 'Yellow', value: 'yellow', hex: '#FFFF00' },
  { label: 'Purple', value: 'purple', hex: '#800080' },
  { label: 'Orange', value: 'orange', hex: '#FFA500' },
  { label: 'Pink', value: 'pink', hex: '#FFC0CB' },
  { label: 'Black', value: 'black', hex: '#000000' },
  { label: 'White', value: 'white', hex: '#FFFFFF' },
  { label: 'Gray', value: 'gray', hex: '#808080' },
  { label: 'Brown', value: 'brown', hex: '#A52A2A' },
  { label: 'Navy', value: 'navy', hex: '#000080' },
  { label: 'Teal', value: 'teal', hex: '#008080' },
  { label: 'Dark Red', value: 'darkred', hex: '#8B0000' },
  { label: 'Dark Blue', value: 'darkblue', hex: '#00008B' },
  { label: 'Cyan', value: 'cyan', hex: '#00FFFF' },
  { label: 'Magenta', value: 'magenta', hex: '#FF00FF' },
  { label: 'Lime', value: 'lime', hex: '#00FF00' },
  { label: 'Indigo', value: 'indigo', hex: '#4B0082' },
  { label: 'Coral', value: 'coral', hex: '#FF7F50' },
  { label: 'Olive', value: 'olive', hex: '#808000' },
  { label: 'Gold', value: 'gold', hex: '#FFD700' },
  { label: 'Violet', value: 'violet', hex: '#EE82EE' },
  { label: 'Slate', value: 'slate', hex: '#708090' },
  { label: 'Crimson', value: 'crimson', hex: '#DC143C' },
  { label: 'Periwinkle', value: 'periwinkle', hex: '#CCCCFF' },
  { label: 'Sea Green', value: 'seagreen', hex: '#2E8B57' },
  { label: 'Forest Green', value: 'forestgreen', hex: '#228B22' },
  { label: 'Light Blue', value: 'lightblue', hex: '#ADD8E6' },
  { label: 'Dark Green', value: 'darkgreen', hex: '#006400' },
  { label: 'Saddle Brown', value: 'saddlebrown', hex: '#8B4513' },
  { label: 'Chocolate', value: 'chocolate', hex: '#D2691E' },
  { label: 'Tan', value: 'tan', hex: '#D2B48C' },
  { label: 'Lavender', value: 'lavender', hex: '#E6E6FA' },
  { label: 'Beige', value: 'beige', hex: '#F5F5DC' },
  { label: 'Turquoise', value: 'turquoise', hex: '#40E0D0' },
  { label: 'Light Green', value: 'lightgreen', hex: '#90EE90' },
  { label: 'Light Pink', value: 'lightpink', hex: '#FFB6C1' },
  { label: 'Light Yellow', value: 'lightyellow', hex: '#FFFFE0' },
  { label: 'Peach', value: 'peach', hex: '#FFDAB9' },
  { label: 'Sky Blue', value: 'skyblue', hex: '#87CEEB' },
  { label: 'Steel Blue', value: 'steelblue', hex: '#4682B4' },
  { label: 'Salmon', value: 'salmon', hex: '#FA8072' },
  { label: 'Plum', value: 'plum', hex: '#DDA0DD' },
  { label: 'Royal Blue', value: 'royalblue', hex: '#4169E1' },
  { label: 'Slate Blue', value: 'slateblue', hex: '#6A5ACD' },
  { label: 'Dark Cyan', value: 'darkcyan', hex: '#008B8B' },
  { label: 'Dark Olive Green', value: 'darkolivegreen', hex: '#556B2F' },
  { label: 'Dark Orchid', value: 'darkorchid', hex: '#9932CC' },
  { label: 'Medium Purple', value: 'mediumpurple', hex: '#9370DB' },
  { label: 'Light Sea Green', value: 'lightseagreen', hex: '#20B2AA' },
  { label: 'Light Coral', value: 'lightcoral', hex: '#F08080' },
  { label: 'Medium Violet Red', value: 'mediumvioletred', hex: '#C71585' },
  { label: 'Medium Turquoise', value: 'mediumturquoise', hex: '#48D1CC' },
  { label: 'Indian Red', value: 'indianred', hex: '#CD5C5C' },
  { label: 'Spring Green', value: 'springgreen', hex: '#00FF7F' },
  { label: 'Deep Pink', value: 'deeppink', hex: '#FF1493' },
  { label: 'Tomato', value: 'tomato', hex: '#FF6347' },
] as const;

export const GraphColorComboBox = ({
  field,
  onSelectColor,
}: {
  field: ControllerRenderProps<
    {
      function: string;
      title: string;
      y_label: string;
      x_label: string;
      graph_color: string;
    },
    'graph_color'
  >;
  onSelectColor: (color: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Fragment>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant='outline'
              role='combobox'
              className={cn(
                'w-[200px] justify-between',
                !field.value && 'text-muted-foreground'
              )}
            >
              {field.value
                ? graphColors.find((color) => color.value === field.value)
                    ?.label
                : 'Select Graph Color'}
              <ChevronsUpDown className='ml2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className='w-[200px] p-0' >
          <Command>
            <CommandInput placeholder='Search color...' />
            <CommandList className='overflow-y-auto' >
              <CommandEmpty>No color found.</CommandEmpty>
              <CommandGroup>
                {graphColors.map((color, i) => (
                  <CommandItem
                    value={color.label}
                    key={`${color.value}{i}`}
                    onSelect={() => {
                      onSelectColor(color.value); // update form value
                      setOpen(false); // close the dropdown
                    }}
                  >
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-4 h-4'
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.label}</span>
                    </div>

                    <Check
                      className={cn(
                        'ml-auto',
                        color.value === field.value
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormDescription>
        This will be the color used for your graph.
      </FormDescription>
    </Fragment>
  );
};
