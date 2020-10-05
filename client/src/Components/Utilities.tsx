import { h } from 'preact';

import './utilities.scss';
import { Size } from './Variables';

type Children = h.JSX.Element | null | Array<h.JSX.Element | null>
type ClassName = string | undefined

export const enum FlexDirection {
    ROW = 'row',
    ROW_REVERSE = 'row-reverse',
    COLUMN = 'column',
    COLUMN_REVERSE = 'column-reverse',
}

type FlexContainerProps = {
    children: Children
    verticalCenter?: boolean
    horizontalCenter?: boolean
    className?: ClassName
    direction: FlexDirection
    style?: string | { [key: string]: string | number };
};
export function FlexContainer({ children, verticalCenter, horizontalCenter, className, direction, ...props }: Partial<FlexContainerProps>): h.JSX.Element {
    const classNames = [
        'c-flex-container',
        verticalCenter ? 'c-flex-container__v-center' : '',
        horizontalCenter ? 'c-flex-container__h-center': '',
        direction ? `c-flex-container__direction-${direction}` : '',
        className,
    ];
    return (
        <div className={classNames.join(' ')} {...props}>
            {children}
        </div>
    )
}

type LogoProps = {
    size: Size
    className: ClassName
}
export function Logo({ size, className, ...props }: LogoProps): h.JSX.Element {
    const classNames = [
        'c-logo',
        size ? `c-logo__size-${size}` : 'c-logo__size-medium',
        className,
    ];
    return (
        <div className={classNames.join(' ')} {...props}>
            <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 103 103" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30.6197 82.3759L22.3897 89.8343C20.868 91.2134 20 93.1714 20 95.225C20 99.2429 23.2571 102.5 27.275 102.5H75.6772C79.7215 102.5 83 99.2215 83 95.1772C83 93.1503 82.1599 91.2141 80.6798 89.8295L73.0711 82.7117C61.1632 71.572 42.7024 71.426 30.6197 82.3759Z" fill="white"/>
                <path d="M72.3803 20.1241L80.6103 12.6657C82.132 11.2866 83 9.32862 83 7.27499C83 3.25712 79.7429 0 75.725 0H27.3228C23.2785 0 20 3.27855 20 7.32284C20 9.34967 20.8401 11.2859 22.3202 12.6705L29.9289 19.7883C41.8368 30.928 60.2976 31.074 72.3803 20.1241Z" fill="white"/>
                <path d="M20.1241 30.6197L12.6657 22.3897C11.2866 20.868 9.32862 20 7.27499 20C3.25712 20 0 23.2571 0 27.275V75.6772C0 79.7215 3.27855 83 7.32284 83C9.34967 83 11.2859 82.1599 12.6705 80.6798L19.7883 73.0711C30.928 61.1632 31.074 42.7024 20.1241 30.6197Z" fill="white"/>
                <path d="M82.3759 30.6197L89.8343 22.3897C91.2134 20.868 93.1714 20 95.225 20C99.2429 20 102.5 23.2571 102.5 27.275V75.6772C102.5 79.7215 99.2215 83 95.1772 83C93.1503 83 91.2141 82.1599 89.8295 80.6798L82.7117 73.0711C71.572 61.1632 71.426 42.7024 82.3759 30.6197Z" fill="white"/>
            </svg>
        </div>
    );
}