import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourcesCard } from './resources-card/resources-card';

@Component({
  selector: 'app-resources-page',
  standalone: true,
  imports: [CommonModule, ResourcesCard],
  templateUrl: './resources-page.html',
  styleUrl: './resources-page.css',
})
export class ResourcesPage {
  heroTitle = 'Resources for harder days';
  heroDescription =
    'A calm place for recipes, videos, articles and support tools to help you manage pain day by day.';

  recipeItems = [
    {
      category: 'Recipe',
      title: 'Anti-inflammatory shot',
      description: 'A quick ginger, lemon and turmeric shot with anti-inflammatory properties.',
      link: 'https://www.bbcgoodfood.com/recipes/ginger-shots',
      image: 'assets/resources/shot.jpg',
      buttonText: 'View recipe',
    },
    {
      category: 'Recipe',
      title: 'Turmeric ginger vegetable soup',
      description: 'A nourishing vegetable soup with turmeric, ginger and a light broth.',
      link: 'https://mayihavethatrecipe.com/vegetable-soup-recipe/',
      image: 'assets/resources/soup.jpg',
      buttonText: 'View recipe',
    },
  ];

  videoItems = [
    {
      category: 'Video',
      title: '5-minute breathing reset',
      description: 'A short breathing practice to help you slow down and relax.',
      link: 'https://www.youtube.com/watch?v=L9g4XhFup9g',
      image: 'assets/resources/breathing.jpg',
      buttonText: 'Watch video',
    },
    {
      category: 'Video',
      title: 'Meditation for pain relief',
      description: 'A guided meditation for easing pain and calming the mind.',
      link: 'https://www.youtube.com/watch?v=HRGsUCW-acs',
      image: 'assets/resources/meditation.jpg',
      buttonText: 'Watch video',
    },
  ];

  articleItems = [
    {
      category: 'Article',
      title: 'Mindfulness to cope with chronic pain',
      description: 'Practical guidance on using mindfulness to manage chronic pain.',
      link: 'https://www.mayoclinichealthsystem.org/hometown-health/speaking-of-health/use-mindfulness-to-cope-with-chronic-pain',
      image: 'assets/resources/article1.jpg',
      buttonText: 'Read article',
    },
    {
      category: 'Article',
      title: 'Mindfulness therapy for chronic pain',
      description: 'Mindfulness-based approaches to help people with chronic pain.',
      link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8297331/',
      image: 'assets/resources/article2.jpg',
      buttonText: 'Read article',
    },
    {
      category: 'Article',
      title: 'Mindfulness traits',
      description: 'Evidence that mindfulness traits may reduce distress and improve wellbeing.',
      link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10712298/',
      image: 'assets/resources/article3.jpg',
      buttonText: 'Read article',
    },
  ];

  helpItems = [
    {
      category: 'Help',
      title: 'Pain Toolkit',
      description: 'A practical guide with tools to help people manage persistent pain day by day.',
      link: 'https://www.iasp-pain.org/publications/relief-news/article/a-toolkit-for-pain-self-management/',
      image: 'assets/resources/help2.jpg',
      buttonText: 'Open resource',
    },
    {
      category: 'Help',
      title: 'Self-Management of Chronic Pain',
      description: 'Integrative guide that highlights relaxation, meditation, biofeedback, and chronic pain relief.',
      link: 'https://www.fammed.wisc.edu/files/webfm-uploads/documents/outreach/im/overview-self-management-of-chronic-pain.pdf',
      image: 'assets/resources/help4.jpg',
      buttonText: 'Open resource',
    },
  ];
}