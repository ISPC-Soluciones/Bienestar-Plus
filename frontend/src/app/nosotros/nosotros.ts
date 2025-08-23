import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nosotros', 
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.css'
})
export class NosotrosComponent {
  title = 'BienestarPlus';


  equipo = [
    {
      nombre: 'Cristian Vellio',
      descripcion: 'Soy una persona automotivada y empática que prospera en entornos colaborativos. Disfruto aprendiendo de los demás, compartiendo conocimientos y enfrentando desafíos de frente. Mi trayectoria refleja mi profundo entusiasmo por el campo de la TI y mi orgullo por convertirme en un Desarrollador de Software dedicado.',
      imagen: '/assets/perfil1.png',
      github: 'https://github.com/CristianVellio',
      linkedin: 'https://www.linkedin.com/in/cristianvellio/?locale=es_ES',
      portafolio: 'https://cristian-vellio-cv.vercel.app/'
    },
    {
      nombre: 'Nahir Ñañez',
      descripcion: 'Soy Nahir Nicolás Ñañez, actualmente soy estudiante avanzado en la Tecnicatura de desarrollo de software y estoy cursando el ultimo año de la Tecnicatura en Desarro Web y Aplicaciones Digitales, ambas en el ISPC. Cuento con conocimentos de desarrollo web, tanto frontend como backend. Además tambien cuento con experiencia en desarrollo de apps móviles para Android. Soy una persona con una gran pasión por el diseño y la creatividad. Siempre estoy en búsqueda de nuevos desafíos y oportunidades para aprender y crecer profesionalmente.',
      imagen: '/assets/perfil2.jpg',
      github: 'https://github.com/nahir1009',
      linkedin: 'https://www.linkedin.com/in/nahir-%C3%B1a%C3%B1ez-63232b218/',
      portafolio: 'https://nahir1009.github.io/portafolio/'
    },
    {
      nombre: 'Franco Miranda',
      descripcion: 'Soy Franco Rodrigo Miranda, estudiante avanzado de la Tecnicatura en Desarrollo de Software, con formación previa en Ingeniería en Sistemas y experiencia en diversas áreas como ventas, docencia y desarrollo de soluciones digitales. Actualmente enfoco mi carrera en el desarrollo de software y la industria IT, combinando conocimientos técnicos con creatividad, constancia y una gran vocación por el aprendizaje.',
      imagen: '/assets/perfil3.jpeg',
      github: 'https://github.com/MirandaFrancoCBA',
      linkedin: 'https://linkedin.com/in/franco-rodrigo-miranda-993710248',
      portafolio: 'https://mirandafrancocba.github.io/Portfolio/'
    },
    {
      nombre: 'Eric Heredia',
      descripcion: 'Soy Eric Heredia, estudiante avanzado en desarrollo de software y comenzando a transitar el desarrollo web y aplicaciones digitales en el Instituto Superior Politécnico de Córdoba. Apasionado por transformar ideas en soluciones digitales innovadoras, mi enfoque se centra en crear proyectos que generen un impacto positivo. Siempre busco potenciar mis habilidades para ofrecer soluciones eficientes y de vanguardia. Te invito a visitar mi portfolio y explorar cómo doy vida a estas ideas.',
      imagen: '/assets/perfil4.png',
      github: 'https://github.com/Heredia-Eric',
      linkedin: 'https://linkedin.com/in/eric-heredia-arg',
      portafolio: 'https://heredia-eric.github.io/portafolio/'
    },
    {
      nombre: 'Santiago Bustos',
      descripcion: 'Me llamo Santiago Bustos, soy un desarrollador junior de 23 años, nacido en Córdoba, Argentina. Actualmente estudiando la tecnicatura superior en desarrollo de software, y con experiencia previa en Ingenieria en Sistemas de información. Apasionado por la tecnología, la programación, y las innovaciones. Cuento con amplio conocimiento de distintos lenguajes, librerías y frameworks, además de siempre mantenerme al día con los nuevos avances tecnológicos.',
      imagen: '/assets/perfil7.jpeg',
      github: 'https://github.com/santyagote',
      linkedin: 'https://www.linkedin.com/in/santiago-andr%C3%A9s-roque-bustos-080943364/',
      portafolio: 'https://santyagote.github.io/Portafolio/'
    },
    {
      nombre: 'Matías León',
      descripcion: 'Soy un estudiante avanzado de la Tecnicatura en Desarrollo de Software del Instituto Superior Politécnico Córdoba (ISPC) , apasionado por la tecnología y profundamente interesado en el avance científico y tecnológico. Me destaco por ser una persona organizada, con una gran curiosidad y un fuerte compromiso con el aprendizaje continuo. Disfruto del trabajo en equipo y tengo facilidad para integrarme y colaborar en entornos dinámicos, donde el intercambio de ideas y conocimientos enriquece cada proyecto.',
      imagen: '/assets/perfil6.jpg',
      github: 'https://github.com/LeonMatias22',
      linkedin: 'https://linkedin.com/',
      portafolio: 'https://leonmatias22.github.io/portafolio/'
    }
  ];
}
