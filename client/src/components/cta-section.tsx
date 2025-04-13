import { motion } from 'framer-motion';
import { ButtonHighlighted } from './ui/button-highlighted';

export default function CtaSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-secondary px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-bold text-3xl md:text-4xl text-white mb-6">Ready to Accelerate Your Career Growth?</h2>
          <p className="text-white/80 text-lg mb-8">Join thousands of professionals who have transformed their careers with personalized AI guidance.</p>
          <ButtonHighlighted variant="white" size="lg" className="mb-4">
            Start Your Free Assessment
          </ButtonHighlighted>
          <p className="text-white/70 text-sm">No credit card required • Free basic plan available</p>
        </motion.div>
      </div>
    </section>
  );
}
