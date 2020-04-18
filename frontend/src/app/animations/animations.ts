import { trigger, style, transition, animate, query, stagger } from '@angular/animations';

export const FadeSite =
  trigger('fadeSite', [
    transition('void => *', [
      style({
        opacity: 0
      }),
      animate('500ms ease', style({
        opacity: 1
      }))
    ]
  ),
    transition('* => void', [
        style({
          opacity: 1,
          filter: 'brightness(100%)'
        }),
        animate('1s 500ms ease', style({
          opacity: 0,
          filter: 'brightness(0%)'
        }))
      ]
    )
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
