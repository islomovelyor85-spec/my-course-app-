import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function MyCourse() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => {
    fetchActiveCourses();
  }, []);

  const fetchActiveCourses = async () => {
    // Faqat chop etilgan kurslarni tortish
    const { data: coursesData } = await supabase
      .from('courses')
      .select('*, modules(*, lessons(*))')
      .eq('status', 'published');

    if (coursesData && coursesData.length > 0) {
      setCourses(coursesData);
      setSelectedCourse(coursesData[0]);
      if (coursesData[0].modules?.[0]?.lessons?.[0]) {
        setActiveLesson(coursesData[0].modules[0].lessons[0]);
      }
    }
  };

  if (!selectedCourse) {
    return <div style={{ padding: '20px', color: '#fff' }}>Faol kurslar topilmadi.</div>;
  }

  return (
    <div style={{ padding: '20px', color: '#fff', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>{selectedCourse.title}</h2>
      <p>{selectedCourse.description}</p>

      {/* Video Pleyer */}
      <div style={{ marginTop: '20px', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' }}>
        {activeLesson?.video_url ? (
          <video 
            key={activeLesson.id}
            src={activeLesson.video_url} 
            controls 
            autoPlay
            style={{ width: '100%', maxHeight: '500px' }} 
          />
        ) : (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            {activeLesson ? "Ushbu darsga video biriktirilmagan" : "Darsni tanlang"}
          </div>
        )}
      </div>

      {/* Modullar va Darslar ro'yxati */}
      <h3 style={{ marginTop: '30px' }}>Darslar dasturi</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
        {selectedCourse.modules?.map((module, mIdx) => (
          <div key={module.id} style={{ border: '1px solid #333', borderRadius: '8px', padding: '15px', background: '#1a1a1a' }}>
            <h4 style={{ color: '#e0e0e0', marginBottom: '10px' }}>{mIdx + 1}-Modul: {module.title}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {module.lessons?.map((lesson, lIdx) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 15px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeLesson?.id === lesson.id ? '#4a5568' : '#2d3748',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  ▶ {mIdx + 1}.{lIdx + 1} {lesson.title}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
