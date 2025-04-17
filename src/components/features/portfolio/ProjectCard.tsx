import Image from 'next/image';
import { useTranslations } from 'next-intl';

import ExternalLink from '@/components/ui/ExternalLink';
import Paragraphs from '@/components/ui/Paragraphs';

import { cn } from '@/lib/style';

interface ProjectCardProps {
  project: string;
}

const TitleBlock: React.FC<{
  subtitle: string;
  title: string;
  className?: string;
}> = ({ subtitle, title, className }) => (
  <div className={cn('mb-2', className)}>
    <p className='text-sm text-pink-700'>{subtitle}</p>
    <h3 className='text-1.5xl/10 font-medium'>{title}</h3>
  </div>
);

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const t = useTranslations('PortfolioPage.projects');

  const techStack = (t.raw(`${project}.techStack`) ?? {}) as Record<
    string,
    string
  >;
  const features = t.raw(`${project}.features`) as Record<string, string>;

  const projectLinks = ['website', 'demoVideo', 'github'] as const;

  return (
    <section key={project}>
      <TitleBlock
        subtitle={t(`${project}.subtitle`)}
        title={t(`${project}.title`)}
        className='px-8 lg:hidden'
      />
      <div className='flex max-w-screen-xl flex-col gap-x-4 px-8 lg:flex-row lg:gap-x-8'>
        <div className='space-y-3 lg:max-w-xl'>
          <Image
            src={`/images/portfolio/${project}.webp`}
            alt={project}
            width={500}
            height={500}
            className='w-full rounded-md shadow'
          />
          <ul className='flex flex-wrap gap-x-2.5'>
            {Object.entries(techStack).map(([key, item]) => (
              <li key={key} className='text-sm text-pink-600'>
                #{item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <TitleBlock
            subtitle={t(`${project}.subtitle`)}
            title={t(`${project}.title`)}
            className='hidden lg:block'
          />
          <div className='mt-4 space-y-3'>
            <Paragraphs text={t(`${project}.description`)} />
            <ul className='list-disc pl-5 leading-8 marker:text-pink-800'>
              {Object.entries(features).map(([key, item]) => (
                <li key={key}>{item}</li>
              ))}
            </ul>
          </div>
          <div className='mt-8 flex justify-end gap-2.5'>
            {projectLinks
              .filter((linkType) => !!t(`${project}.${linkType}`))
              .map((linkType) => {
                const linkData = t(`${project}.${linkType}`);
                return (
                  <ExternalLink
                    key={linkType}
                    href={linkData}
                    className={cn(
                      'w-fit rounded-md px-4 py-2 text-sm hover:no-underline',
                      linkType === 'website'
                        ? 'bg-pink-700 text-white'
                        : 'border border-pink-700 bg-white text-pink-700'
                    )}
                  >
                    <span>{t(`${linkType}`)} </span>
                    <span>
                      {project === 'stocklight' &&
                        linkType === 'github' &&
                        ' (FE)'}
                    </span>
                  </ExternalLink>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectCard;
