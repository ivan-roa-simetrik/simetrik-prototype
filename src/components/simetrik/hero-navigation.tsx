'use client'

import { useState, type ReactNode } from 'react'

import { useMedia } from 'react-use'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet'
import Logo from '@/components/simetrik/logo'

import { cn } from '@/lib/utils'
import { MenuIcon, ChevronRightIcon, CircleSmallIcon } from 'lucide-react'

type NavigationSection = {
  type: 'section'
  title: string
  items: NavigationItem[]
}

type NavigationItem = {
  title: string
  href: string
  icon?: ReactNode
  badge?: ReactNode
  description?: string
}

type Navigation = {
  title: string
  contentClassName?: string
} & (
  | {
      items: NavigationSection[]
      splitItems: true
      href?: never
    }
  | {
      items: NavigationItem[]
      splitItems?: never | false
      href?: never
    }
  | {
      items?: never
      splitItems?: never
      href: string
    }
)

const ListItem = (props: {
  title: NavigationItem['title']
  href: NavigationItem['href']
  icon?: NavigationItem['icon']
  badge?: NavigationItem['badge']
  description?: NavigationItem['description']
  splitItems?: boolean
}) => {
  const { title, href, icon, badge, description, splitItems } = props

  return (
    <li className={cn({ 'h-19.5': description && splitItems })}>
      <NavigationMenuLink href={href} className={cn({ 'flex flex-row items-start gap-2': icon })}>
        {icon && (
          <span className='bg-popover [&>svg]:text-popover-foreground! flex aspect-square size-7 shrink-0 items-center justify-center rounded-sm border [&>svg]:size-4'>
            {icon}
          </span>
        )}
        {description ? (
          <div className='space-y-0.5'>
            <div className={cn('font-medium', { 'flex items-center gap-1.5': badge })}>
              {title}
              {badge}
            </div>
            <p className='text-muted-foreground line-clamp-2'>{description}</p>
          </div>
        ) : (
          <div className={cn('font-medium', { 'flex items-center gap-1.5': badge })}>
            {title}
            {badge}
          </div>
        )}
      </NavigationMenuLink>
    </li>
  )
}

const HeroNavigation01 = ({
  navigationData,
  navigationClassName
}: {
  navigationData: Navigation[]
  navigationClassName?: string
}) => {
  return (
    <NavigationMenu className={cn('hidden lg:block', navigationClassName)} align='center'>
      <NavigationMenuList className='flex-wrap gap-1.5'>
        {navigationData.map(navItem => {
          if (navItem.href) {
            // Root link item
            return (
              <NavigationMenuItem key={navItem.title}>
                <NavigationMenuLink
                  href={navItem.href}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    'text-muted-foreground hover:text-primary bg-transparent! px-3 py-1.5 text-base!'
                  )}
                >
                  {navItem.title}
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          }

          // Section with dropdown
          return (
            <NavigationMenuItem key={navItem.title}>
              <NavigationMenuTrigger className='text-muted-foreground hover:text-primary dark:hover:bg-accent/50 bg-transparent! px-3 py-1.5 text-base [&>svg]:size-4'>
                {navItem.title}
              </NavigationMenuTrigger>
              <NavigationMenuContent className='w-auto rounded-[inherit] shadow-lg!'>
                {navItem.splitItems ? (
                  <div className={cn('grid grid-cols-1 gap-2', navItem.contentClassName)}>
                    {navItem.items.map(section => (
                      <div key={section.title} className='grid grid-cols-1 gap-2'>
                        <div className='text-muted-foreground px-2 text-sm'>{section.title}</div>
                        <ul
                          className={cn('grid grid-cols-1 gap-0.5', {
                            'gap-2': section.items.find(item => item.description)
                          })}
                        >
                          {section.items.map((item, index) => (
                            <ListItem
                              key={index}
                              icon={item.icon}
                              title={item.title}
                              description={item.description}
                              href={item.href}
                              badge={item.badge}
                              splitItems={navItem.splitItems}
                            />
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul
                    className={cn(
                      'grid grid-cols-1 gap-0.5',
                      { 'gap-2': navItem.items?.find(item => item.description) },
                      navItem.contentClassName
                    )}
                  >
                    {navItem.items?.map((item, index) => (
                      <ListItem
                        key={index}
                        icon={item.icon}
                        title={item.title}
                        description={item.description}
                        href={item.href}
                        badge={item.badge}
                      />
                    ))}
                  </ul>
                )}
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const HeroNavigation01SmallScreen = ({
  navigationData,
  triggerClassName,
  logo,
  screenSize = 1023
}: {
  navigationData: Navigation[]
  triggerClassName?: string
  screenSize?: number
  logo?: React.ReactNode
}) => {
  const [open, setOpen] = useState(false)
  const isMobile = useMedia(`(max-width: ${screenSize}px)`, false)

  const handleLinkClick = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open && isMobile} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant='outline' size='icon' className={cn('inline-flex lg:hidden', triggerClassName)}>
            <MenuIcon />
            <span className='sr-only'>Menu</span>
          </Button>
        }
      />
      <SheetContent side='left' className='w-75 gap-0 p-0'>
        <SheetHeader className='p-4'>
          <SheetTitle hidden />
          <SheetDescription hidden />
          <a href='#' onClick={handleLinkClick} className='self-start'>
            {logo ?? <Logo className='gap-3' />}
          </a>
        </SheetHeader>
        <div className='space-y-0.5 overflow-y-auto p-2'>
          {navigationData.map((navItem, index) => {
            if (navItem.href) {
              return (
                <a
                  key={navItem.title}
                  href={navItem.href}
                  className='hover:bg-accent flex items-center gap-2 rounded-sm px-3 py-2 text-sm'
                  onClick={handleLinkClick}
                >
                  {navItem.title}
                </a>
              )
            }

            return (
              <Collapsible key={index} className='w-full'>
                <CollapsibleTrigger className='hover:bg-accent group flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm'>
                  <div className='flex items-center gap-2'>{navItem.title}</div>
                  <ChevronRightIcon className='size-4 shrink-0 transition-transform duration-300 group-data-panel-open:rotate-90' />
                </CollapsibleTrigger>
                <CollapsibleContent className='h-(--collapsible-panel-height) overflow-hidden transition-all duration-300 data-ending-style:h-0 data-starting-style:h-0'>
                  {navItem.splitItems
                    ? navItem.items.map((item, i) => (
                        <div key={i} className='mt-1.5'>
                          <div className='text-muted-foreground mb-1 pl-4.5 text-xs font-medium'>{item.title}</div>
                          {item.items.map((subItem, j) => (
                            <a
                              key={j}
                              href={subItem.href}
                              className='hover:bg-accent ml-4.5 flex items-center gap-2 rounded-sm px-3 py-2 text-sm'
                              onClick={handleLinkClick}
                            >
                              {subItem.icon ? (
                                subItem.icon
                              ) : (
                                <CircleSmallIcon className='size-4' />
                              )}
                              {subItem.title}
                            </a>
                          ))}
                        </div>
                      ))
                    : navItem.items?.map(item => (
                        <a
                          key={item.title}
                          href={item.href}
                          className='hover:bg-accent ml-3 flex items-center gap-2 rounded-sm px-3 py-2 text-sm'
                          onClick={handleLinkClick}
                        >
                          {item.icon ? (
                            item.icon
                          ) : (
                            <CircleSmallIcon className='size-4' />
                          )}
                          {item.title}
                        </a>
                      ))}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { HeroNavigation01, HeroNavigation01SmallScreen, type Navigation, type NavigationItem, type NavigationSection }
