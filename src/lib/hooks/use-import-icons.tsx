import { faCheck } from '@fortawesome/pro-duotone-svg-icons/faCheck';
import { faChevronDown } from '@fortawesome/pro-duotone-svg-icons/faChevronDown';
import { faChevronLeft } from '@fortawesome/pro-duotone-svg-icons/faChevronLeft';
import { faChevronRight } from '@fortawesome/pro-duotone-svg-icons/faChevronRight';
import { faChevronUp } from '@fortawesome/pro-duotone-svg-icons/faChevronUp';
import { faCircle } from '@fortawesome/pro-duotone-svg-icons/faCircle';
import { faCirclePause } from '@fortawesome/pro-duotone-svg-icons/faCirclePause';
import { faCirclePlus } from '@fortawesome/pro-duotone-svg-icons/faCirclePlus';
import { faCircleX } from '@fortawesome/pro-duotone-svg-icons/faCircleX';
import { faClock } from '@fortawesome/pro-duotone-svg-icons/faClock';
import { faCog } from '@fortawesome/pro-duotone-svg-icons/faCog';
import { faPartyHorn } from '@fortawesome/pro-duotone-svg-icons/faPartyHorn';
import { faPause } from '@fortawesome/pro-duotone-svg-icons/faPause';
import { faPlay } from '@fortawesome/pro-duotone-svg-icons/faPlay';
import { faSignIn } from '@fortawesome/pro-duotone-svg-icons/faSignIn';
import { faUserPlus } from '@fortawesome/pro-duotone-svg-icons/faUserPlus';
import { faUsers } from '@fortawesome/pro-duotone-svg-icons/faUsers';
import { faX } from '@fortawesome/pro-duotone-svg-icons/faX';
import { useEffect } from 'react';

import { initFontAwesome } from '@/components/ui/icon';

export default function useImportIcons() {
  useEffect(() => {
    initFontAwesome(
      [
        faCheck,
        faX,
        faSignIn,
        faCirclePlus,
        faPause,
        faCirclePause,
        faCircleX,
        faChevronRight,
        faChevronLeft,
        faCog,
        faChevronDown,
        faChevronUp,
        faClock,
        faPlay,
        faCircle,
        faPartyHorn,
        faUserPlus,
        faUsers,
      ],
      {
        type: 'fad',
        size: 'lg',
      }
    );
  }, []);
  return null;
}
