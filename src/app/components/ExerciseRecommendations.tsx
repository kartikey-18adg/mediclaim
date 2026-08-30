import React from 'react';
import { Dumbbell, PersonStanding, Wind, Timer, Flame, Target } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  duration: string;
  intensity: 'Low' | 'Moderate' | 'High';
  caloriesBurn: number;
  benefit: string;
  icon: React.ReactNode;
  aiReason: string;
  intensityColor: string;
}

const exercises: Exercise[] = [
  {
    id: 'ex-brisk-walk',
    name: 'Brisk Walking',
    category: 'Cardio',
    duration: '30 min',
    intensity: 'Low',
    caloriesBurn: 145,
    benefit: 'Reduces BP by 4–9 mmHg',
    icon: <PersonStanding size={18} className="text-primary" />,
    aiReason: 'Recommended due to borderline BP (128/83) — low-impact cardio is safest',
    intensityColor: 'badge-positive',
  },
  {
    id: 'ex-yoga',
    name: 'Pranayama & Yoga',
    category: 'Flexibility',
    duration: '20 min',
    intensity: 'Low',
    caloriesBurn: 85,
    benefit: 'Improves SpO₂ & reduces stress',
    icon: <Wind size={18} className="text-info" />,
    aiReason: 'SpO₂ dipped to 95% on 13 Aug — breathing exercises improve lung capacity',
    intensityColor: 'badge-positive',
  },
  {
    id: 'ex-resistance',
    name: 'Light Resistance Training',
    category: 'Strength',
    duration: '25 min',
    intensity: 'Moderate',
    caloriesBurn: 210,
    benefit: 'Improves insulin sensitivity',
    icon: <Dumbbell size={18} className="text-warning" />,
    aiReason: 'Blood glucose at 112 mg/dL — resistance training improves glucose metabolism',
    intensityColor: 'badge-warning',
  },
];

export default function ExerciseRecommendations() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">AI Exercise Plan</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Personalized based on your vitals & history</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
          <Target size={12} />
          Today&apos;s Plan
        </div>
      </div>

      <div className="space-y-3">
        {exercises.map((ex) => (
          <div key={ex.id} className="border border-border rounded-xl p-3.5 hover:bg-muted/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                {ex.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">{ex.name}</p>
                  <span className={`badge ${ex.intensityColor} text-xs`}>{ex.intensity}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{ex.benefit}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Timer size={11} />
                    {ex.duration}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Flame size={11} className="text-warning" />
                    ~{ex.caloriesBurn} kcal
                  </span>
                </div>
                <p className="text-xs text-accent/80 bg-accent/5 rounded-lg px-2 py-1 mt-2 leading-relaxed">
                  💡 {ex.aiReason}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Flame size={12} className="text-warning" />
          Total burn estimate:
          <span className="font-semibold text-foreground tabular-nums">440 kcal</span>
        </div>
        <button className="btn-primary text-xs py-1.5 px-3 rounded-lg">
          Start Workout
        </button>
      </div>
    </div>
  );
}