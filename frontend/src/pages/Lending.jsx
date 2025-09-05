import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const navigate = useNavigate();

  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: "Real-Time Team Creation",
      description: "Create teams instantly and see changes reflected without delays. No page reloads, no waiting — just smooth, responsive updates.",
    },
    {
      title: "Task Assignment & Updates",
      description: "Quickly assign tasks, set priorities, and track progress. Real-time updates mean no more status meetings.",
    },
    {
      title: "Role-Based Access Control",
      description: "Clearly define who can view, edit, or manage content. Built-in security without adding complexity.",
    },
    {
      title: "Comments & File Sharing",
      description: "Discuss tasks right where they happen. Attach files, drop feedback, and move forward with clarity.",
    },
  ];

  const testimonials = [
    { name: "Sarah K.", role: "Project Manager", text: "TaskForge transformed how our team collaborates. Real-time updates are a game-changer!" },
    { name: "Mike R.", role: "Developer", text: "Finally, a tool that doesn't get in the way. Clean, fast, and actually useful." },
    { name: "Lisa M.", role: "Team Lead", text: "The role-based access is perfect. Everyone knows their responsibilities." }
  ];
  const comingSoonTasks = [
    { text: "Finalize project concept, database design, and system architecture", completed: true },
    { text: "Develop backend server with Express.js, including authentication and role-based access control", completed: true },
    { text: "Create and integrate CRUD APIs for teams, projects, and tasks with assignment and tracking features", completed: true },
    { text: "Design and implement responsive frontend UI using React and TailwindCSS, integrated with backend APIs", completed: true },
    { text: "Develop core dashboard with project/task overviews and basic team management", completed: true },
    { text: "Optimize performance, enhance security, and deploy production build to cloud hosting", completed: true },
    { text: "Officially launch the application for public use", completed: false },
    { text: "Implement advanced collaboration features (email invitations, file sharing, in-app notifications)", completed: false },
  ];
  
  
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-[#FF1E00] rounded-full opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );

  const AnimatedGrid = () => (
    <div className="absolute inset-0 opacity-5">
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF1E00] to-transparent"
        style={{
          backgroundImage: 'linear-gradient(90deg, transparent 49%, #FF1E00 50%, transparent 51%), linear-gradient(transparent 49%, #FF1E00 50%, transparent 51%)',
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}
      />
      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );

  const TypewriterText = ({ text, delay = 0 }) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      const timer = setTimeout(() => {
        if (currentIndex < text.length) {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }
      }, delay + currentIndex * 50);

      return () => clearTimeout(timer);
    }, [currentIndex, text, delay]);

    return (
      <span>
        {displayText}
        <span className="animate-pulse">|</span>
      </span>
    );
  };

  return (
    <div className="bg-[#191818] text-white min-h-screen overflow-x-hidden">
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        <AnimatedGrid />
        <FloatingParticles />
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight overflow-hidden">
              <span 
                className="block bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent transform transition-all duration-1000 ease-out"
              >
                TaskForge
              </span>
            </h1>
            <div className="overflow-hidden">
              <p 
                className="text-2xl md:text-3xl font-light text-gray-300 mb-4 transform translate-y-full"
                style={{ animation: 'slideUp 1s ease-out 0.1s forwards' }}
              >
                <TypewriterText text="Create Teams. Assign Tasks. Collaborate Instantly."  />
              </p>
            </div>
            <div className="overflow-hidden">
              <p 
                className="text-lg text-gray-400 max-w-2xl mx-auto transform translate-y-full"
                style={{ animation: 'slideUp 1s ease-out 0.6s forwards' }}
              >
                The only task management tool that feels as fast as your thoughts and as organized as your best day.
              </p>
            </div>
          </div>

          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12 opacity-0
            "
            style={{ animation: 'fadeInUp 1s ease-out 1.2s forwards' }}
          >
            <button  onClick={() => navigate("/login?demo=true")} 
             className="border-2 border-[#333333] hover:border-[#FF1E00] hover:bg-[#FF1E00]/10 px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:-rotate-1 hover:shadow-lg">
              <span className="relative z-10">Try Demo</span>
               </button>
            
          </div>

          <div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-0"
            style={{ animation: 'fadeInUp 1s ease-out 1.5s forwards' }}
          >
            {['100%', '0ms', '5min', '∞'].map((stat, index) => (
              <div key={index} className="text-center group hover:scale-110 transition-transform duration-300">
                <div 
                  className="text-3xl font-bold  mb-2"
                  style={{ 
                    animation: `countUp 2s ease-out ${1.8 + index * 0.2}s forwards, pulse 2s ease-in-out infinite ${2 + index * 0.3}s` 
                  }}
                >
                  {stat}
                </div>
                <div className="text-sm text-gray-400">
                  {['Real-time', 'Delay', 'Setup', 'Scalability'][index]}
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes slideUp {
            to { transform: translateY(0); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes glow {
            from { text-shadow: 0 0 20px rgba(255, 30, 0, 0.3); }
            to { text-shadow: 0 0 30px rgba(255, 30, 0, 0.6); }
          }
          @keyframes countUp {
            from { transform: scale(0) rotate(180deg); opacity: 0; }
            to { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>
      </section>

      <section className="py-24 px-6" id="features" data-animate>
        <div className="max-w-6xl mx-auto">
          <div 
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Features that <span className="text-[#FF1E00] animate-pulse">actually</span> matter
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We built TaskForge with one goal: make team collaboration feel effortless. 
              Here's how we're changing the game.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group cursor-pointer p-8 rounded-2xl border-2 transition-all duration-500 hover:scale-105 transform ${
                  activeFeature === index
                    ? 'border-[#FF1E00] bg-[#FF1E00]/5 scale-105 rotate-1'
                    : 'border-[#333333] hover:border-[#555555] hover:-rotate-1'
                } ${
                  isVisible.features 
                    ? `opacity-100 translate-y-0` 
                    : 'opacity-0 translate-y-10'
                }`}
                style={{ 
                  transitionDelay: `${index * 0.1}s`,
                  animation: isVisible.features ? `slideInRotate 0.8s ease-out ${index * 0.2}s forwards` : 'none'
                }}
                onClick={() => setActiveFeature(index)}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="flex items-start gap-6 relative overflow-hidden">
                  <div 
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-xl`}
                  />
                 
                  
                  
                  <div className="flex-1 relative z-10">
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-[#FF1E00] transition-all duration-300 transform group-hover:translate-x-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 mb-4 leading-relaxed transform group-hover:translate-x-1 transition-transform duration-300">
                      {feature.description}
                    </p>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes slideInRotate {
            from { opacity: 0; transform: translateX(-50px) rotate(-10deg); }
            to { opacity: 1; transform: translateX(0) rotate(0deg); }
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1); }
            40% { transform: translateY(-10px) scale(1.1); }
            60% { transform: translateY(-5px) scale(1.05); }
          }
        `}</style>
      </section>
      <section className="py-24 px-6 bg-[#0f0f0f] relative overflow-hidden" id="coming-soon" data-animate>
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, #FF1E00 2px, transparent 2px), radial-gradient(circle at 75% 75%, #FF1E00 1px, transparent 1px)',
              backgroundSize: '50px 50px',
              animation: 'patternMove 15s linear infinite'
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div 
            className={`text-center mb-12 transition-all duration-1000 ${
              isVisible['coming-soon'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div 
                className="text-4xl"
                style={{ animation: 'bounce 2s ease-in-out infinite' }}
              >
                🚀
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                To Do List 
              </h2>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              We're working hard behind the scenes. Here's what's in our development pipeline.
            </p>
          </div>

          <div 
            className={`bg-[#191818] border border-[#333333] rounded-xl p-8 shadow-2xl transition-all duration-1000 ${
              isVisible['coming-soon'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <div className="space-y-3">
              {comingSoonTasks.map((task, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-500 hover:bg-[#222222] group ${
                    isVisible['coming-soon'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                  }`}
                  style={{ 
                    transitionDelay: `${500 + index * 100}ms`,
                    animation: isVisible['coming-soon'] ? `slideInLeft 0.6s ease-out ${0.5 + index * 0.1}s forwards` : 'none'
                  }}
                >
                  <div className="flex-shrink-0">
                    <div 
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                        task.completed 
                          ? 'bg-[#FF1E00] border-[#FF1E00] text-white' 
                          : 'border-gray-500 hover:border-gray-400'
                      }`}
                    >
                      {task.completed && (
                        <svg 
                          className="w-3 h-3" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                          style={{ animation: 'checkmark 0.5s ease-out' }}
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <span 
                      className={`text-sm transition-all duration-300 ${
                        task.completed 
                          ? 'text-gray-500 line-through' 
                          : 'text-gray-300 group-hover:text-white'
                      }`}
                    >
                      {task.text}
                    </span>
                  </div>

                  <div className="flex-shrink-0">
                    {task.completed ? (
                      <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full border border-green-700">
                        Done
                      </span>
                    ) : (
                      <span className="text-xs bg-[#FF1E00]/20 text-[#FF1E00] px-2 py-1 rounded-full border border-[#FF1E00]/30">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div 
              className={`mt-8 pt-6 border-t border-[#333333] transition-all duration-1000 ${
                isVisible['coming-soon'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{ transitionDelay: '1200ms' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Development Progress</span>
                <span className="text-sm text-[#FF1E00] font-semibold">
                  {Math.round((comingSoonTasks.filter(task => task.completed).length / comingSoonTasks.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-[#333333] rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF1E00] to-[#ff4500] rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${(comingSoonTasks.filter(task => task.completed).length / comingSoonTasks.length) * 100}%`,
                    animation: isVisible['coming-soon'] ? 'progressFill 2s ease-out 1.5s forwards' : 'none'
                  }}
                />
              </div>
            </div>
          </div>

          <div 
            className={`text-center mt-8 transition-all duration-1000 ${
              isVisible['coming-soon'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '1500ms' }}
          >
            <p className="text-gray-400 mb-4">
              Want to be notified when these features launch?
            </p>
            <button 
              onClick={() => navigate("/login?demo=true")}
              className="bg-[#FF1E00] hover:bg-[#e51a00] px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#FF1E00]/50"
            >
              Try Current Version
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes patternMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes checkmark {
            0% { transform: scale(0) rotate(45deg); }
            50% { transform: scale(1.2) rotate(45deg); }
            100% { transform: scale(1) rotate(45deg); }
          }
          @keyframes progressFill {
            from { width: 0%; }
          }
        `}</style>
      </section>


      <section className="py-24 px-6 bg-[#111111] relative overflow-hidden" id="why" data-animate>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-[#FF1E00] rounded-full opacity-5 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-[#333333] rounded-full opacity-5" style={{ animation: 'float 6s ease-in-out infinite' }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 
            className={`text-5xl font-bold mb-8 transition-all duration-1000 ${
              isVisible.why ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Why <span className="text-[#FF1E00] relative">
              TaskForge
              <span className="absolute -inset-1  "></span>
            </span>?
          </h2>
          
          <p 
            className={`text-xl text-gray-300 mb-12 leading-relaxed transition-all duration-1000 delay-200 ${
              isVisible.why ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Most task tools either feel like toy apps or overwhelming beasts. 
            TaskForge hits the sweet spot — packed with features, yet simple enough to feel natural.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {  title: 'Lightning Fast', desc: 'Real-time everything, no reloads, no waiting around' },
              {  title: 'Purpose Built', desc: 'Role-based power without the headache or complexity' },
              {  title: 'All-in-One', desc: 'Comments, file sharing, and collaboration built right in' }
            ].map((item, index) => (
              <div 
                key={index}
                className={`p-6 rounded-xl bg-[#191818] border border-[#333333] hover:border-[#FF1E00] transition-all duration-500 hover:scale-105 hover:rotate-2 transform ${
                  isVisible.why ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ 
                  transitionDelay: `${400 + index * 150}ms`,
                  animation: isVisible.why ? `slideInScale 0.8s ease-out ${0.4 + index * 0.15}s forwards` : 'none'
                }}
              >
                <div 
                  className="text-3xl mb-4 transform transition-all duration-300 hover:scale-125"
                  style={{ animation: 'floatIcon 3s ease-in-out infinite' }}
                >
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 hover:text-[#FF1E00] transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>

          <button 
          onClick={() => navigate("/login?demo=true")}
            className={`bg-[#FF1E00] hover:bg-[#e51a00] px-10 py-4 rounded-full font-bold text-white text-lg transition-all duration-300 transform hover:scale-110 hover:shadow-2xl hover:shadow-[#FF1E00]/50 active:scale-95 ${
              isVisible.why ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ 
              transitionDelay: '800ms',
              animation: isVisible.why ? 'pulse 2s ease-in-out infinite 1s' : 'none'
            }}
          >
            Try Demo Now
          </button>
        </div>

        <style jsx>{`
          @keyframes slideInScale {
            from { opacity: 0; transform: scale(0.8) translateY(30px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes floatIcon {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-5px) rotate(5deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-30px); }
          }
        `}</style>
      </section>

      

      <section className="py-24 px-6 bg-[#111111] relative overflow-hidden" id="about" data-animate>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23FF1E00" fill-opacity="0.1"%3E%3Cpath d="M20 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0-20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8z"/%3E%3C/g%3E%3C/svg%3E")',
            animation: 'backgroundMove 20s linear infinite'
          }}
        />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 
            className={`text-4xl font-bold mb-8 transition-all duration-1000 ${
              isVisible.about ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <span 
              className="text-[#FF1E00] text-5xl transform inline-block transition-all duration-300 hover:scale-125 hover:rotate-12"
              style={{ animation: 'bounce 2s ease-in-out infinite' }}
            >
              👨‍💻
            </span> About the Developer
          </h2>
          
          <p 
            className={`text-xl text-gray-300 mb-8 leading-relaxed transition-all duration-1000 delay-300 ${
              isVisible.about ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            TaskForge is the project — born from curiosity, built with caffeine, and launched with late-night
            adrenaline. I'm <span className="font-semibold text-[#FF1E00] hover:glow transition-all duration-300">Amrit</span>, a student engineer who's trying
            to make something cool, simple, and useful. 🚀
          </p>
          
          <div 
            className={`flex justify-center gap-6 transition-all duration-1000 delay-500 ${
              isVisible.about ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {[
              { href: "https://github.com/amritcodes", text: "GitHub" },
              { href: "https://linkedin.com/in/amrit-dev", text: "LinkedIn" }
            ].map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-[#333333] rounded-full hover:border-[#FF1E00] hover:text-[#FF1E00] transition-all duration-300 transform hover:scale-110 hover:-rotate-2 hover:shadow-lg"
           
              >
                {link.text}
              </a>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes backgroundMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(40px, 40px); }
          }
        `}</style>
      </section>

      <section className="py-24 px-6 text-center relative overflow-hidden" id="final-cta" >
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div
              className="absolute bg-[#FF1E00] rounded-full opacity-10"
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <h2 
            className={`text-5xl font-bold mb-6 transition-all duration-1000 `}
          >
            Ready to transform your team?
          </h2>
          
          <p 
            className={`text-xl text-gray-300 mb-12 transition-all duration-1000 delay-300 `}
          >
            Join thousands of teams who've already made the switch to effortless collaboration.
          </p>
          
          <button 
          onClick={() => navigate("/login?demo=true")}
          className="border-2 border-[#333333] hover:border-[#FF1E00] hover:bg-[#FF1E00]/10 px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:-rotate-1 hover:shadow-lg">
            <span className="relative z-10">Try Demo - It's Free</span>
          </button>
          
          <p 
            className={`text-sm text-gray-400 mt-4 transition-all duration-1000 delay-800 `}
          >
            No credit card required • Set up in 5 minutes
          </p>
        </div>

        <style jsx>{`
          @keyframes textGlow {
            from { text-shadow: 0 0 20px rgba(255, 30, 0, 0.3); }
            to { text-shadow: 0 0 40px rgba(255, 30, 0, 0.8); }
          }
          @keyframes megaPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 30, 0, 0.7); }
            50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(255, 30, 0, 0); }
          }
        `}</style>
      </section>

      <footer className="bg-[#0d0d0d] text-gray-500 py-8 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #FF1E00 0, #FF1E00 1px, transparent 1px, transparent 10px)',
              animation: 'slideBackground 10s linear infinite'
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-6">
            <p className="mb-4 hover:text-[#FF1E00] transition-colors duration-300 cursor-default">
              Made with ☕, React, and sleepless nights 💻🌙
            </p>
            <div className="flex justify-center gap-6">
              {[
                { href: "https://github.com/amritcodes", text: "GitHub" },
                { href: "mailto:amrit@example.com", text: "Email" },
                { href: "https://amrit-portfolio.com", text: "Portfolio" }
              ].map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FF1E00] transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                  
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>
          <div className="text-center text-xs text-gray-600 hover:text-gray-400 transition-colors duration-300">
            © 2025 TaskForge. Built by Amrit
          </div>
        </div>

        <style jsx>{`
          @keyframes slideBackground {
            0% { transform: translateX(0); }
            100% { transform: translateX(10px); }
          }
          @keyframes footerFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }
        `}</style>
      </footer>

      <style jsx global>{`
        * {
          scroll-behavior: smooth;
        }
        
        .hover\\:glow:hover {
          text-shadow: 0 0 10px rgba(255, 30, 0, 0.8);
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #191818;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #FF1E00;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #e51a00;
        }

        /* Custom selection color */
        ::selection {
          background: rgba(255, 30, 0, 0.3);
          color: white;
        }

        /* Smooth transitions for all interactive elements */
        button, a, div, p, h1, h2, h3 {
          transition: all 0.3s ease;
        }

        /* Enhanced focus states for accessibility */
        button:focus-visible, a:focus-visible {
          outline: 2px solid #FF1E00;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default Landing;