from django.views.generic import TemplateView


class ViteView(TemplateView):
    """A view that serves the SPA built with Vite."""
    template_name = 'index.html'
    react_view = 'pageNotFound'

