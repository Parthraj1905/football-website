# Player Images Guide

## Using Placeholder Images

The website is set up to display a standardized placeholder for all player photos in the Top Scorers section, using a single shared image. This approach offers several benefits:

- Reduces loading time and bandwidth usage
- Simplifies the codebase with no need for dynamic image paths
- Prevents system slowdowns when loading many images
- Provides a consistent visual appearance across all players

### Placeholder Image

The player placeholder is located at:
```
/public/img/players/default.webp
```

You can replace this file with your preferred placeholder image. Recommendations:
- Use a simple silhouette or icon design
- Keep the file small (under 5KB if possible)
- Use WebP format for better performance
- Use a square image (1:1 aspect ratio)
- Optimal size is 200×200 pixels

### Switching to Individual Player Images (Optional)

If you later decide to use individual player images instead of placeholders, you would need to:

1. Modify the `getPlayerImagePath` function in `src/app/(Standings)/league-stats/[league]/scorers/page.tsx` to use player-specific paths
2. Add individual player images to the `/public/img/players/` directory
3. Update the error handling to include fallback mechanisms

For now, the placeholder approach is recommended as it provides the best performance with minimal resource usage. 