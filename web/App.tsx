import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Certifications from './components/Certifications';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';
import MatrixRain from './components/effects/MatrixRain';
import ScrollProgress from './components/effects/ScrollProgress';
import LoadingScreen from './components/LoadingScreen';
import { useTheme } from './hooks/useTheme';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    // Simulate loading time for smooth entrance
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Apply theme class to document
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-dark-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Background Effects */}
            {theme === 'dark' && (
              <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <MatrixRain />
                <div className="absolute inset-0 bg-cyber-grid bg-[size:50px_50px] opacity-5" />
              </div>
            )}

            {/* Scroll Progress */}
            <ScrollProgress />

            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <main className="relative z-10">
              <Hero />
              <About />
              <Skills />
              <Projects />
              <Certifications />
              <Blog />
              <Contact />
            </main>

            {/* Footer */}
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;