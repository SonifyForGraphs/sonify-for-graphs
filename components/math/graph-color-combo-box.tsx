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
  { label: 'Red', value: 'red' },
  { label: 'Blue', value: 'blue' },
  { label: 'Green', value: 'green' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Purple', value: 'purple' },
  { label: 'Orange', value: 'orange' },
  { label: 'Pink', value: 'pink' },
  { label: 'Black', value: 'black' },
  { label: 'White', value: 'white' },
  { label: 'Gray', value: 'gray' },
  { label: 'Brown', value: 'brown' },
  { label: 'Navy', value: 'navy' },
  { label: 'Teal', value: 'teal' },
  { label: 'Dark Red', value: 'darkred' },
  { label: 'Dark Blue', value: 'darkblue' },
  { label: 'Cyan', value: 'cyan' },
  { label: 'Magenta', value: 'magenta' },
  { label: 'Lime', value: 'lime' },
  { label: 'Indigo', value: 'indigo' },
  { label: 'Coral', value: 'coral' },
  { label: 'Olive', value: 'olive' },
  { label: 'Gold', value: 'gold' },
  { label: 'Violet', value: 'violet' },
  { label: 'Slate', value: 'slate' },
  { label: 'Crimson', value: 'crimson' },
  { label: 'Periwinkle', value: 'periwinkle' },
  { label: 'Sea Green', value: 'seagreen' },
  { label: 'Forest Green', value: 'forestgreen' },
  { label: 'Light Blue', value: 'lightblue' },
  { label: 'Dark Green', value: 'darkgreen' },
  { label: 'Saddle Brown', value: 'saddlebrown' },
  { label: 'Chocolate', value: 'chocolate' },
  { label: 'Tan', value: 'tan' },
  { label: 'Lavender', value: 'lavender' },
  { label: 'Beige', value: 'beige' },
  { label: 'Turquoise', value: 'turquoise' },
  { label: 'Light Green', value: 'lightgreen' },
  { label: 'Light Pink', value: 'lightpink' },
  { label: 'Light Yellow', value: 'lightyellow' },
  { label: 'Peach', value: 'peach' },
  { label: 'Sky Blue', value: 'skyblue' },
  { label: 'Steel Blue', value: 'steelblue' },
  { label: 'Salmon', value: 'salmon' },
  { label: 'Plum', value: 'plum' },
  { label: 'Royal Blue', value: 'royalblue' },
  { label: 'Slate Blue', value: 'slateblue' },
  { label: 'Dark Cyan', value: 'darkcyan' },
  { label: 'Dark Olive Green', value: 'darkolivegreen' },
  { label: 'Dark Orchid', value: 'darkorchid' },
  { label: 'Medium Purple', value: 'mediumpurple' },
  { label: 'Light Sea Green', value: 'lightseagreen' },
  { label: 'Light Coral', value: 'lightcoral' },
  { label: 'Medium Violet Red', value: 'mediumvioletred' },
  { label: 'Medium Turquoise', value: 'mediumturquoise' },
  { label: 'Indian Red', value: 'indianred' },
  { label: 'Spring Green', value: 'springgreen' },
  { label: 'Deep Pink', value: 'deeppink' },
  { label: 'Tomato', value: 'tomato' },
] as const;

export const GraphColorComboBox = ({
  field,
  onSelectColor
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
  onSelectColor: (color: string) => void
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
        <PopoverContent className='w-[200px] p-0 overflow-y-auto'>
          <Command>
            <CommandInput placeholder='Search color...' />
            <CommandList>
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
                    {color.label}
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
