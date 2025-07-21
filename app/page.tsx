"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center p-8">
            <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
            <p className="mb-6">Please refresh the page or try again later.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const Portfolio = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    meshes: THREE.Mesh<
      | THREE.BoxGeometry
      | THREE.SphereGeometry
      | THREE.ConeGeometry
      | THREE.OctahedronGeometry
      | THREE.TorusGeometry,
      THREE.MeshStandardMaterial,
      THREE.Object3DEventMap
    >[];
  } | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Three.js scene setup
  useEffect(() => {
    try {
      if (!mountRef.current) return;

      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mountRef.current.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      scene.add(directionalLight);

      // Create floating geometric shapes
      const geometries = [
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.SphereGeometry(0.8, 32, 32),
        new THREE.ConeGeometry(0.8, 1.5, 8),
        new THREE.OctahedronGeometry(1),
        new THREE.TorusGeometry(0.8, 0.3, 16, 100),
      ];

      const materials = [
        new THREE.MeshStandardMaterial({
          color: 0x64ffda,
          transparent: true,
          opacity: 0.8,
        }),
        new THREE.MeshStandardMaterial({
          color: 0xff6b6b,
          transparent: true,
          opacity: 0.8,
        }),
        new THREE.MeshStandardMaterial({
          color: 0x4ecdc4,
          transparent: true,
          opacity: 0.8,
        }),
        new THREE.MeshStandardMaterial({
          color: 0xffe66d,
          transparent: true,
          opacity: 0.8,
        }),
        new THREE.MeshStandardMaterial({
          color: 0xa8e6cf,
          transparent: true,
          opacity: 0.8,
        }),
      ];

      const meshes: THREE.Mesh<
        | THREE.BoxGeometry
        | THREE.SphereGeometry
        | THREE.ConeGeometry
        | THREE.OctahedronGeometry
        | THREE.TorusGeometry,
        THREE.MeshStandardMaterial,
        THREE.Object3DEventMap
      >[] = [];
      
      for (let i = 0; i < 20; i++) {
        const geometry =
          geometries[Math.floor(Math.random() * geometries.length)];
        const material = materials[Math.floor(Math.random() * materials.length)];
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 30
        );

        mesh.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );

        mesh.userData = {
          rotationSpeed: {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02,
          },
          floatSpeed: Math.random() * 0.02 + 0.01,
          floatAmplitude: Math.random() * 2 + 1,
        };

        scene.add(mesh);
        meshes.push(mesh);
      }

      camera.position.z = 15;
      sceneRef.current = { scene, camera, renderer, meshes };

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);

        meshes.forEach((mesh, index) => {
          mesh.rotation.x += mesh.userData.rotationSpeed.x;
          mesh.rotation.y += mesh.userData.rotationSpeed.y;
          mesh.rotation.z += mesh.userData.rotationSpeed.z;

          mesh.position.y +=
            Math.sin(Date.now() * mesh.userData.floatSpeed + index) * 0.01;
        });

        renderer.render(scene, camera);
      };
      
      let animationId: number;
      const startAnimation = () => {
        animationId = requestAnimationFrame(animate);
      };
      
      startAnimation();

      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener("resize", handleResize);

      return () => {
        const currentMount = mountRef.current;
        
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(animationId);
        if (currentMount && renderer.domElement) {
          currentMount.removeChild(renderer.domElement);
        }
        renderer.dispose();
        
        // Dispose of geometries and materials
        geometries.forEach(geometry => geometry.dispose());
        materials.forEach(material => material.dispose());
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"));
      console.error("Error in Three.js setup:", err);
    }
  }, []);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      try {
        const scrollY = window.scrollY;
        const sectionHeight = window.innerHeight;
        const section = Math.floor(scrollY / sectionHeight);
        setCurrentSection(section);

        if (sceneRef.current) {
          const { camera } = sceneRef.current;
          camera.position.y = scrollY * -0.01;
          camera.rotation.x = scrollY * 0.0005;
        }
      } catch (err) {
        console.error("Error in scroll handler:", err);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const projects = [
    {
      title: "Sensai Career Coach",
      description:
        "AI-powered career platform using Next.js and Node.js with Google Gemini API integration",
      tech: [
        "Next.js",
        "Node.js",
        "Google Gemini API",
        "Clerk",
        "Prisma",
        "Tailwind CSS",
      ],
      color: "from-purple-500 to-pink-500",
      link: "https://github.com/yasin321288/sensai_AI_career_coach",
      Vlink: "https://sensai-ai-career-coach-hazel.vercel.app/",
    },
    {
      title: "Medimeet",
      description:
        "Online doctor's appointment platform with real-time chat and appointment scheduling",
      tech: ["Next.js", "Clerk", "Tailwind CSS", "MongoDB", "Prisma", "vonage"],
      color: "from-yellow-500 to-cyan-400",
      link: "https://github.com/yasin321288/Medimeet-online-doctors-appointment-",
      Vlink: "https://medimeet-online-doctors-appointment-brown.vercel.app/",
    },
    {
      title: "Droply",
      description:
        "Responsive image platform with secure authentication and privacy controls",
      tech: ["Next.js", "TypeScript", "Clerk", "Tailwind CSS"],
      color: "from-blue-500 to-cyan-500",
      link: "https://github.com/yasin321288/Droply",
      Vlink: "https://github.com/yasin321288/Droply",
    },
    {
      title: "Online Quiz Maker",
      description:
        "Full-stack quiz solution with auto-grading logic and real-time participation",
      tech: ["JavaScript", "HTML", "CSS", "Node.js"],
      color: "from-green-500 to-emerald-500",
      link: "https://github.com/yasin321288/online_quiz_maker",
      Vlink: "https://github.com/yasin321288/online_quiz_maker",
    },
  ];

  const achievements = [
    " Secured Top 5 in ZS Campus Beat at Maharaja Agrasen Institute of Technology, Delhi",
    "Solved 400+ DSA Questions on LeetCode and GeeksforGeeks",
  ];

  const certifications = [
    {
      title: "User Experience Design Fundamentals",
      issuer: "IBM SkillsBuild",
      date: "April 2025",
      link: "https://www.credly.com/badges/445d95d7-d10b-451a-9815-b3eee91b5281/public_url",
    },
    {
      title: "Google AI Essentials",
      issuer: "Coursera",
      date: "May 2025",
      link: "https://coursera.org/share/adbe567c300642665648e4f01e907e6f",
    },
    {
      title: "Cybersecurity Fundamentals",
      issuer: "IBM SkillsBuild",
      date: "May 2025",
      link: "https://www.credly.com/badges/49760445-2bd3-48dc-969b-c4a6d8c024a6/public_url",
    },
    {
      title: "AWS APAC Solutions Architecture Virtual Experience Program",
      issuer: "Forge",
      date: "June 2025",
      link: "https://forage-uploads-prod.s3.amazonaws.com/completion-certificates/pmnMSL4QiQ9JCgE3W/kkE9HyeNcw6rwCRGw_pmnMSL4QiQ9JCgE3W_CrBTbC8XBg8PP2PgG_1749358157185_completion_certificate.pdf",
    },
  ];

  const smoothScrollTo = (id: string) => {
    try {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } catch (err) {
      console.error("Error in smoothScrollTo:", err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-4">Error Loading Portfolio</h1>
          <p className="mb-6">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="relative">
        {/* Three.js Canvas */}
        <div ref={mountRef} className="fixed top-0 left-0 w-full h-full -z-10" />

        {/* Navigation */}
        <motion.nav 
          className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 backdrop-blur-2xl"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <motion.div 
              className="text-xl md:text-2xl font-bold text-white"
              whileHover={{ scale: 1.05 }}
            >
              Portfolio
            </motion.div>
            
            {/* Mobile menu button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-cyan-400 transition-colors md:hidden"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </motion.button>
            
            {/* Desktop menu */}
            <div className="hidden md:flex space-x-6 lg:space-x-8">
              {["Home", "About", "Projects", "Experience", "Certifications", "Contact"].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className={`text-white hover:text-cyan-400 transition-all duration-300 ${
                    currentSection === index
                      ? "text-cyan-400 border-b-2 border-cyan-400"
                      : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    smoothScrollTo(item.toLowerCase());
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </div>
            
          {/* Mobile menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                className="absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-md md:hidden flex flex-col space-y-4 p-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {["Home", "About", "Projects", "Experience", "Certifications", "Contact"].map((item, index) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className={`text-white hover:text-cyan-400 transition-all duration-300 text-lg ${
                      currentSection === index
                        ? "text-cyan-400 border-l-4 border-cyan-400 pl-3"
                        : "pl-3"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      smoothScrollTo(item.toLowerCase());
                      setIsMenuOpen(false);
                    }}
                    whileHover={{ x: 10 }}
                  >
                    {item}
                  </motion.a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* Hero Section */}
        <section
          id="home"
          className="min-h-screen flex items-center justify-center relative"
        >
          <motion.div 
            className="text-center text-white z-10 px-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-br from-cyan-400 to-green-500 bg-clip-text text-transparent"
              whileHover={{ scale: 1.02 }}
            >
              Yasin Sheikh
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-8 opacity-80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Software Developer | Full-Stack Web & AI Enthusiast
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                onClick={() => smoothScrollTo("projects")}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-cyan-400/25 transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(34, 211, 238, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                View My Work
              </motion.button>
              <motion.button
                onClick={() => smoothScrollTo("contact")}
                className="border border-cyan-400 text-cyan-400 px-8 py-3 rounded-full hover:bg-cyan-400 hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Me
              </motion.button>
            </motion.div>
          </motion.div>
        </section>

        {/* About Section */}
        <section
          id="about"
          className="min-h-screen flex items-center justify-center relative py-20"
        >
          <motion.div 
            className="container mx-auto px-6 text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="backdrop-blur-md bg-white/10 rounded-3xl p-6 md:p-12 border border-white/20"
              whileHover={{ scale: 1.005 }}
            >
              <motion.h2 
                className="text-5xl font-bold mb-8 text-center"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                About Me
              </motion.h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-3xl font-bold mb-4 text-cyan-400">
                    Professional Summary
                  </h3>
                  <ul className="list-disc pl-5 space-y-3 mb-6">
                    <motion.li
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      Software Developer with expertise in Full-Stack Web
                      Development and AI, skilled in React.js, Next.js, Node.js,
                      and MongoDB.
                    </motion.li>
                    <motion.li
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      viewport={{ once: true }}
                    >
                      Experienced in AI-powered career guidance systems,
                      integrating Google Gemini API, Clerk, and Prisma.
                    </motion.li>
                    <motion.li
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      viewport={{ once: true }}
                    >
                      Strong in Data Structures and Algorithms with 300+ problems
                      solved.
                    </motion.li>
                    <motion.li
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      viewport={{ once: true }}
                    >
                      Proven success in coding challenges and hackathons,
                      committed to continuous learning and innovation.
                    </motion.li>
                  </ul>

                  <h3 className="text-3xl font-bold mb-4 text-cyan-400">
                    Technical Skills
                  </h3>
                  <div className="mb-6">
                    <p className="font-semibold mb-2">Languages:</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {["Java", "Python", "C", "C++", "JavaScript", "SQL"].map((lang, i) => (
                        <motion.span
                          key={lang}
                          className={`${lang === "Java" ? "bg-cyan-400/20 text-cyan-400" : 
                                       lang === "Python" ? "bg-blue-400/20 text-blue-400" :
                                       lang === "C" ? "bg-purple-400/20 text-purple-400" :
                                       lang === "C++" ? "bg-green-400/20 text-green-400" :
                                       lang === "JavaScript" ? "bg-yellow-400/20 text-yellow-400" :
                                       "bg-red-400/20 text-red-400"} px-3 py-1 rounded-full`}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          viewport={{ once: true }}
                        >
                          {lang}
                        </motion.span>
                      ))}
                    </div>

                    <p className="font-semibold mb-2">Web Development:</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {["React.js", "Next.js", "MongoDB", "Node.js", "Express.js", "Tailwind CSS"].map((tech, i) => (
                        <motion.span
                          key={tech}
                          className={`${tech === "React.js" ? "bg-cyan-400/20 text-cyan-400" : 
                                       tech === "Next.js" ? "bg-blue-400/20 text-blue-400" :
                                       tech === "MongoDB" ? "bg-purple-400/20 text-purple-400" :
                                       tech === "Node.js" ? "bg-green-400/20 text-green-400" :
                                       tech === "Express.js" ? "bg-yellow-400/20 text-yellow-400" :
                                       "bg-red-400/20 text-red-400"} px-3 py-1 rounded-full`}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                          viewport={{ once: true }}
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>

                    <p className="font-semibold mb-2">ML Libraries:</p>
                    <div className="flex flex-wrap gap-2">
                      {["Pandas", "NumPy", "Matplotlib", "TensorFlow"].map((lib, i) => (
                        <motion.span
                          key={lib}
                          className={`${lib === "Pandas" ? "bg-cyan-400/20 text-cyan-400" : 
                                       lib === "NumPy" ? "bg-blue-400/20 text-blue-400" :
                                       lib === "Matplotlib" ? "bg-purple-400/20 text-purple-400" :
                                       "bg-green-400/20 text-green-400"} px-3 py-1 rounded-full`}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ delay: 0.7 + i * 0.1 }}
                          viewport={{ once: true }}
                        >
                          {lib}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex justify-center"
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full flex items-center justify-center">
                    <motion.div 
                      className="w-48 h-48 md:w-60 md:h-60 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-80"
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ 
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                        scale: { duration: 4, repeat: Infinity }
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Experience Section */}
        <section
          id="experience"
          className="min-h-screen flex items-center justify-center relative py-20"
        >
          <motion.div 
            className="container mx-auto px-6 text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="backdrop-blur-md bg-white/10 rounded-3xl p-6 md:p-12 border border-white/20"
              whileHover={{ scale: 1.005 }}
            >
              <motion.h2 
                className="text-5xl font-bold mb-12 text-center"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                Experience
              </motion.h2>

              <motion.div 
                className="mb-16"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                  <motion.h3 
                    className="text-2xl font-bold"
                    whileHover={{ x: 5 }}
                  >
                    Outlier Front End Developer For AI Training (Freelance)
                  </motion.h3>
                  <motion.span 
                    className="bg-cyan-400/20 text-cyan-400 px-4 py-1 rounded-full whitespace-nowrap"
                    whileHover={{ scale: 1.05 }}
                  >
                    May 2025 - Present
                  </motion.span>
                </div>
                <ul className="list-disc pl-5 space-y-2">
                  <motion.li
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    Reviewed and validated peer pull requests by analyzing changes
                    in JSON files before and after edits to ensure accuracy and
                    functionality.
                  </motion.li>
                  <motion.li
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    viewport={{ once: true }}
                  >
                    Edited and regenerated problem statements to improve clarity
                    and effectiveness for AI model training.
                  </motion.li>
                  <motion.li
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    viewport={{ once: true }}
                  >
                    Provided structured feedback on AI outputs, supporting the
                    continuous improvement of generative AI systems.
                  </motion.li>
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Projects Section */}
        <section
          id="projects"
          className="min-h-screen flex items-center justify-center relative py-20"
        >
          <div className="container mx-auto px-6 text-white">
            <motion.h2 
              className="text-5xl font-bold text-center mb-14"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              Featured Projects
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20 hover:scale-[1.02] transition-all duration-500 group cursor-pointer"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
                  }}
                >
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-r ${project.color} rounded-2xl mb-6 group-hover:rotate-225 transition-transform duration-300`}
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity }
                    }}
                  />
                  <h3 className="text-2xl font-bold mb-4">{project.title}</h3>
                  <p className="text-gray-300 mb-6">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((tech, techIndex) => (
                      <motion.span
                        key={techIndex}
                        className="inline-block bg-white/10 text-white px-3 py-1 rounded-full text-sm"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: 0.3 + techIndex * 0.05 }}
                        viewport={{ once: true }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <motion.a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-white transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      View on GitHub →
                    </motion.a>
                    <motion.a
                      href={project.Vlink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-white transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      View on Vercel →
                    </motion.a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section
          id="achievements"
          className="min-h-screen flex items-center justify-center relative py-20"
        >
          <motion.div 
            className="container mx-auto px-6 text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="backdrop-blur-md bg-white/10 rounded-3xl p-6 md:p-12 border border-white/20"
              whileHover={{ scale: 1.005 }}
            >
              <motion.h2 
                className="text-3xl font-bold mb-12 text-center"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                Achievements
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-8">
                {achievements.map((achievement, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start space-x-4"
                    initial={{ x: index % 2 === 0 ? -50 : 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <motion.div 
                      className="bg-cyan-400/20 text-cyan-400 p-3 rounded-full flex-shrink-0"
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ 
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                        scale: { duration: 4, repeat: Infinity }
                      }}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </motion.div>
                    <motion.p 
                      className="text-lg"
                      whileHover={{ x: 5 }}
                    >
                      {achievement}
                    </motion.p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Certifications Section */}
        <section
          id="certifications"
          className="min-h-screen flex items-center justify-center relative py-20"
        >
          <motion.div 
            className="container mx-auto px-6 text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="backdrop-blur-md bg-white/10 rounded-3xl p-6 md:p-12 border border-white/20"
              whileHover={{ scale: 1.005 }}
            >
              <motion.h2 
                className="text-4xl font-bold mb-12 text-center"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                Certifications
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-8">
                {certifications.map((cert, index) => (
                  <motion.div
                    key={index}
                    className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10 hover:scale-[1.02] transition-all duration-300"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ 
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      <motion.div 
                        className="bg-cyan-400/20 text-cyan-400 p-3 rounded-full flex-shrink-0"
                        animate={{ 
                          rotate: 360,
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ 
                          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                          scale: { duration: 4, repeat: Infinity }
                        }}
                      >
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold mb-1">{cert.title}</h3>
                        <p className="text-gray-300 mb-2">
                          {cert.issuer} • {cert.date}
                        </p>
                        <motion.a
                          href={cert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-white transition-colors text-sm"
                          whileHover={{ x: 5 }}
                        >
                          View Credential →
                        </motion.a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          className="min-h-screen flex items-center justify-center relative py-20"
        >
          <motion.div 
            className="container mx-auto px-6 text-white text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="backdrop-blur-md bg-white/10 rounded-3xl p-6 md:p-12 border border-white/20 max-w-2xl mx-auto"
              whileHover={{ scale: 1.005 }}
            >
              <motion.h2 
                className="text-5xl font-bold mb-8"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                Contact Me
              </motion.h2>
              <motion.p 
                className="text-xl mb-12 opacity-80"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
              >
                I&apos;m always open to discussing new projects, creative ideas, or
                opportunities to be part of your vision.
              </motion.p>
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <motion.div 
                  className="text-center"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center"
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity }
                    }}
                  >
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">Email</h3>
                  <motion.a 
                    href="mailto:yasinsheikhofficial@gmail.com" 
                    className="text-gray-300 hover:text-cyan-400 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    yasinsheikhofficial@gmail.com
                  </motion.a>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-r from-pink-300 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center"
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity }
                    }}
                  >
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      />
                    </svg>
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">Phone</h3>
                  <motion.a 
                    href="tel:+919834327583" 
                    className="text-gray-300 hover:text-cyan-400 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    +91-9834327583
                  </motion.a>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center"
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity }
                    }}
                  >
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      />
                    </svg>
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">LinkedIn</h3>
                  <motion.a
                    href="https://linkedin.com/in/yasin-sheikh-101874244"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-cyan-400 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    linkedin.com/in/yasin-sheikh-101874244
                  </motion.a>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center"
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity }
                    }}
                  >
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                      />
                    </svg>
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2">GitHub</h3>
                  <motion.a
                    href="https://github.com/yasin321288"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-cyan-400 transition-colors"
                    whileHover={{ x: 5 }}
                  >
                    github.com/yasin321288
                  </motion.a>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          body {
            margin: 0;
            background: linear-gradient(
              135deg,
              #0f0f23 0%,
              #1a1a2e 50%,
              #16213e 100%
            );
            overflow-x: hidden;
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
};

export default Portfolio;