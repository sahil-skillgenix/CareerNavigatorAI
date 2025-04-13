import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const testimonials = [
  {
    quote: "CareerPathAI helped me identify exactly which skills I needed to develop to advance in my field. Within 8 months, I secured a promotion that would have taken years otherwise.",
    name: "Michael Rodriguez",
    title: "Software Engineer",
    initials: "MR"
  },
  {
    quote: "The skill assessment was eye-opening. I discovered strengths I hadn't recognized and areas for improvement that were holding me back. Now I have a clear roadmap for my career growth.",
    name: "Sarah Johnson",
    title: "Marketing Director",
    initials: "SJ"
  },
  {
    quote: "As someone pivoting careers, I was lost on where to start. CareerPathAI provided a structured approach to identify transferable skills and exactly what I needed to learn to make a successful transition.",
    name: "David Chen",
    title: "Former Teacher, Now UX Designer",
    initials: "DC"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" id="testimonials">
      <div className="container mx-auto">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-bold text-3xl md:text-4xl mb-4">What Our Users Say</h2>
          <p className="text-lg text-gray-700/70">Discover how CareerPathAI has transformed professional journeys.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-white rounded-xl shadow-md p-4 relative hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full">
                <CardContent className="p-4">
                  <div className="absolute -top-5 left-8 text-5xl text-blue-200">"</div>
                  <p className="text-gray-700/70 mb-6 pt-4">{testimonial.quote}</p>
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarFallback className="bg-primary-light/30 text-primary-dark">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
