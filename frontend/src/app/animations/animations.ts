import { trigger, state, style, transition, animate, query, stagger, group } from '@angular/animations';

export const AnimateBar =
  trigger('expandBar', [
    state('expanded', style ({
      width: '320px'
    })),
    state('closed', style ({
      width: '70px'
    })),
    transition('expanded <=> closed', [
      animate('0.2s ease')
    ])
  ]);

export const FadeText =
  trigger('displayText', [
    transition('* => *', [
      query(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease', style({ opacity: 1 }))
      ], { optional: true }
      ),
      query(':leave',
        animate('200ms ease', style({ opacity: 0 })),
        { optional: true }
      ),
    ])
  ]);

export const ContentSize =
  trigger('contentSizing', [
    state('expanded', style ({
      'margin-left': '321px'
    })),
    state('closed', style ({
      'margin-left': '71px'
    })),
    transition('expanded <=> closed', [
      animate('200ms ease')
    ])
  ]);

export const FadeIn =
  trigger('fadeIn', [
    transition('* => *', [
      query(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease', style({ opacity: 1 }))
      ], { optional: true}
      )
    ])
  ]);

export const FadeInRetarded =
  trigger('fadeInRetarded', [
    transition('* <=> *', [
      query(':enter', [
        style({ opacity: 0 }), stagger('100ms', animate('600ms ease', style({ opacity: 1 })))
      ], { optional: true }
      )
    ])
  ]);
