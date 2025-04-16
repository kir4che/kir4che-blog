import { useTranslations } from 'next-intl';

import ProjectCard from '@/components/features/portfolio/ProjectCard';
import Title from '@/components/features/portfolio/Title';

const Projects: React.FC = () => {
  const t = useTranslations('PortfolioPage.projects');
  const projects = ['stocklight', 'mern-ec-website'] as const;

  return (
    <section
      id='projects'
      className='mx-auto bg-yellow-50/20 pt-16 pb-8 lg:py-24'
    >
      <Title className='mb-8' text={t('title')} />
      <div className='mx-auto w-fit space-y-20'>
        {projects.map((project) => (
          <ProjectCard key={project} project={project} />
        ))}
      </div>
    </section>
  );
};

export default Projects;
