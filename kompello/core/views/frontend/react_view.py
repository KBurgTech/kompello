from django.views.generic import TemplateView


class ReactView(TemplateView):
    """A view that serves a single build react page (or any other javascript page)."""
    template_name = 'react_view.html'
    react_view = 'pageNotFound'

    def __init__(self, react_view=None):
        if react_view:
            self.react_view = react_view

    def view_context(self):
        return {}

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['react_view'] = self.react_view + ".js"
        context.update(self.view_context())

        return {"context": context}
