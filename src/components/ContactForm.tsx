'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to deliver message.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setStatus('error');
      setErrorMessage(
        'Unable to send message via form right now. Please feel free to email me directly.'
      );
    }
  };

  return (
    <section
      id="contact"
      aria-label="Contact Shubham Kumar"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-950 relative border-t border-zinc-900"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-2">Get In Touch</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight animate-text-shimmer">
            Contact Me
          </h2>
          <div className="w-16 h-1 bg-white mx-auto mt-3 rounded-full" />
          <p className="text-zinc-400 text-sm sm:text-base mt-4">
            Have a project, role opportunity, or question in mind? Send a message and it will be delivered directly to my inbox and database.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
          {/* Contact Direct Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
              <h3 className="text-2xl font-bold text-white">
                Let&apos;s Build Something <span className="text-zinc-400 font-normal">Extraordinary</span>
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                I am currently open to full-time software developer opportunities, contract engagements, and innovative full stack development collaborations.
              </p>

              <address className="not-italic space-y-4 pt-2">
                <a
                  href="mailto:shubhammisra800@gmail.com"
                  className="flex items-center gap-4 p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-white/30 transition-colors group"
                  aria-label="Send email to shubhammisra800@gmail.com"
                >
                  <div className="p-3 rounded-lg bg-white/10 text-white group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Email Address</p>
                    <p className="text-sm font-semibold text-white group-hover:text-zinc-200 transition-colors">
                      shubhammisra800@gmail.com
                    </p>
                  </div>
                </a>

                <a
                  href="tel:+919322887529"
                  className="flex items-center gap-4 p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-white/30 transition-colors group"
                  aria-label="Call or WhatsApp +91 9322887529"
                >
                  <div className="p-3 rounded-lg bg-white/10 text-white group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Call / WhatsApp</p>
                    <p className="text-sm font-semibold text-white group-hover:text-zinc-200 transition-colors">
                      +91 9322887529
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <div className="p-3 rounded-lg bg-white/10 text-white">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Location</p>
                    <p className="text-sm font-semibold text-white">
                      Pune, Maharashtra, India
                    </p>
                  </div>
                </div>
              </address>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-2xl backdrop-blur-xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter Full Name"
                      className="w-full px-4 py-3 rounded-xl bg-black/70 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter Email Id"
                      className="w-full px-4 py-3 rounded-xl bg-black/70 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      pattern="[0-9]{10}"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit Phone"
                      className="w-full px-4 py-3 rounded-xl bg-black/70 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Project or Inquiry Subject"
                      className="w-full px-4 py-3 rounded-xl bg-black/70 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Your Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    maxLength={400}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your project, question, or opportunity..."
                    className="w-full px-4 py-3 rounded-xl bg-black/70 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white text-sm transition-all resize-y"
                  />
                  <p className="text-[11px] text-zinc-500 text-right mt-1">
                    {formData.message.length}/400 characters
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-black font-bold shadow-lg shadow-white/10 hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-black" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>

              {/* Success Notification Alert */}
              {status === 'success' && (
                <div className="mt-5 p-4 rounded-xl bg-white/10 border border-white/30 text-white flex items-start gap-3 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-bold text-white">Message Sent Successfully!</p>
                    <p className="text-zinc-300 mt-0.5">
                      Thank you! Your message has been saved to the database and delivered directly to my email (<span className="text-white font-medium">shubhammisra800@gmail.com</span>). I will respond shortly.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Notification Alert */}
              {status === 'error' && (
                <div className="mt-5 p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 flex items-start gap-3 animate-fadeIn">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-bold text-white">Submission Issue</p>
                    <p className="text-zinc-300 mt-0.5">
                      {errorMessage}{' '}
                      <a
                        href="mailto:shubhammisra800@gmail.com"
                        className="text-white underline font-semibold"
                      >
                        shubhammisra800@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
