import {
  findIconDefinition,
  type IconDefinition,
  type IconLookup,
  type IconPack,
  type IconProp,
  library,
} from '@fortawesome/fontawesome-svg-core';
import {
  FontAwesomeIcon,
  type FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome';
import { useMemo } from 'react';

export type FontAwesomeType = 'fad' | 'fadl' | 'fadr' | 'fadt' | 'fal' | 'far';

let _defaultType: FontAwesomeType = 'fad';
let _defaultSize: FontAwesomeIconProps['size'] = 'lg';

export default function ({
  icon,
  type,
  size = _defaultSize,
  ...props
}: FontAwesomeIconProps & { type?: FontAwesomeType }) {
  const { iconDef, iconName } = useMemo(() => {
    let iconDef: IconProp | undefined = isIconObject(icon) ? icon : undefined;
    let iconName: string | undefined = (iconDef as IconDefinition)?.iconName;
    if (!iconDef) {
      const _type = type ?? _defaultType;
      if (_type) {
        if (typeof icon === 'string') {
          iconDef = { prefix: _type, iconName: icon };
          iconName = icon;
        } else {
          throw new Error(
            `icon property must be a string or an object- {prefix: string, iconName: string}`
          );
        }
      } else {
        throw new Error(
          `You must provided a type or a defaultType (via initFontAwesome)`
        );
      }
    }
    const iconDefFromLibrary = findIconDefinition(iconDef as IconLookup);
    if (!iconDefFromLibrary) {
    }
    return { iconDef, iconName };
  }, [icon, type]);

  return (
    <FontAwesomeIcon {...props} icon={iconDef} id={iconName} size={size} />
  );
}

export function initFontAwesome(
  iconPacks: (IconPack | IconDefinition)[],
  defaults: { type?: FontAwesomeType; size?: FontAwesomeIconProps['size'] }
) {
  library.add(...iconPacks);
  if (defaults.type) {
    _defaultType = defaults.type;
  }
  if (defaults.size) {
    _defaultSize = defaults.size;
  }
}

function isIconObject(icon: IconProp): icon is IconProp {
  return typeof icon === 'object' && 'prefix' in icon && 'iconName' in icon;
}
